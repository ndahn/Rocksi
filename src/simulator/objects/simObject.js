import { BoxBufferGeometry,
         MeshPhongMaterial,
         CylinderGeometry,
         Mesh,
         Vector3,
         Euler,
         Object3D,
         Group } from 'three';

import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import { requestAF,
         getScene,
         getRobot,
         getControl,
         addListeners,
         removeListeners } from '../scene';

import { getWorld,
         updateBodies,
         updateCollisionBodies } from '../physics';

import { addSimObject,
         remSimObjects,
         addGeometry,
         simObjectCollision } from './createObjects'

import { Box,
         Vec3,
         Body,
         Material,
         ConvexPolyhedron,
         Sphere,
         Cylinder } from 'cannon-es'

import * as Blockly from 'blockly/core'

const debug = false;

export class SimObject extends Group {
    constructor() {
        super();
        this.name = undefined;
        this.type = 'simObject';
        this.shape = 'cube'; //default
        this.attached = false;
        this.hasBody = false;
        this.body = undefined;
        this.control = undefined;
        this._fieldValues = [5, 0, 0, 0, 0, 0];
        this.colour = '#eb4034'
        this.highlighted = false;
        this.bodyShape = 'box';
        this.radius = 0;
        if (debug) {
            console.log('simObject debug mode on!',);
        }
        this.mass = 0;
        this.checkCollision = false;
        this.collisionPosition = new Vector3();
        this.lastPositionsArray = [];
    }
    size = new Vector3(.5, .5, .5);

    //Positioning
    _calcFieldValues() {
        let fieldValues = [];
        let radValues = [];

        this.position.toArray(fieldValues);
        if (this.bodyShape === 'sphere') {
            fieldValues[2] = fieldValues[2] - this.radius;
        } else if (this.bodyShape === 'cylinder') {
            fieldValues[2] = fieldValues[2] - this.size.z * .5;
        } else {
            fieldValues[2] = fieldValues[2] - this.size.z * .5;
        }
        this.rotation.toArray(radValues);
        for (let i = 0; i < 3; i++) {
            let val = this._radToDeg(radValues[i]);
            fieldValues.push(parseInt(val.toFixed()));
        }

        return fieldValues;
    }

    updateFieldValues() {
        this._fieldValues = this._calcFieldValues();
    }

    _radToDeg (rad) { return rad * 180 / Math.PI; }
    _degToRad (deg) { return  deg * Math.PI / 180.0; }

    getFieldValues() {
        return this._fieldValues;
    }

    setFieldValues(fieldValues) {
        this._fieldValues = fieldValues;
    }

    updateFromFieldValues() {
        let posArray = [];
        let eulArray = [];
        for (let i = 0; i < 3; i++) {
            posArray.push(this._fieldValues[i]);
            eulArray.push(parseFloat(this._degToRad(this._fieldValues[i + 3]).toFixed(3)));
        }

        for (let i = 0; i < 2; i++) {
            this.position.setComponent(i, posArray[i]);
        }
        this.position.setComponent(2, posArray[2] + this.size.z * .5);
        this.rotation.fromArray(eulArray);
    }

    checkPosition(){

    }

    //callback for objectChange
    _objectChange() {
        const world = getWorld();
        this.body.mass = 0;
        this.body.isTrigger = true;
        this.body.wakeUp();
        //updateCollisionBodies();
        this.updateCollisionBody();
        world.step(0.2);
        if (this.control.visible && !this.attached) {
            if (this.position.z < 0) {
                this.position.z = this.size.z * .5;
                this.body.position.copy(this.position);
            }
            this.render();
        }
    }

    updatePoseBlock() {
        const fieldKeys = ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW'];
        const workspace = Blockly.getMainWorkspace();
        if (workspace) {
            const block = workspace.getBlockById(this.name);
            if (block) {
                const pose = block.getInputTargetBlock('POSE');
                if (pose) {
                    for (var i = 0; i < this._fieldValues.length; i++) {
                        let val = this._fieldValues[i];
                        pose.setFieldValue(val, fieldKeys[i]);
                    }
                }

            }
        }
    }

    //Visiblity and scene
    render() { requestAF(); }

    addToScene() {
        const scene = getScene();
        const world = getWorld();
        scene.add(this);
        this.initTransformControl();

        this.render();
    }

    removeFromScene() {
        const scene = getScene();
        const world = getWorld();

        //if (this.hasBody) { world.removeBody(this.body); }
        if (this.isAttached) { scene.attach(this) }

        this.control.visible = true; //otherwise the renderer throws an error.
                                     //I suspect that threejs removes the
                                     //controls if visible is false.
        scene.remove(this.control);
        scene.remove(this);
        world.removeBody(this.body);
        this.render();
    }

    makeVisible() {
        const scene = getScene();
        scene.add(this.control);
        this.addTransformListeners();
        scene.add(this);
        this.render();
    }

    hide() {
        const scene = getScene();
        scene.remove(this.control);
        this.removeTransformListners();
        scene.remove(this);
        this.render();
    }

    highlight(status) {
        const limit = this.children.length;
        if (status) {
            for (let i = 0; i < limit; i++) {
                if (this.children[i].material != undefined) {
                    const colour = this.children[i].material.color.getHex();
                    this.children[i].material.emissive.setHex(colour);
                }
            }
            this.highlighted = status;
        } else if (!status) {
            for (let i = 0; i < limit; i++) {
                if (this.children[i].material != undefined) {
                    this.children[i].material.emissive.setHex(0x000000);
                }
            }
            this.highlighted = status;
        }
        this.render();
    }

    setColour(colour) {
        for (const child of this.children) {
            child.material = new MeshPhongMaterial({ color: colour });
        }
    }

    changeShape(shape) {
        this.shape = shape;
        const world = getWorld();
        for (const child of this.children) {
            this.remove(child);
        }
        this.removeFromScene();
        world.removeBody(this.body);
        addGeometry(this);
        this.addToScene();
        console.log('Changed to shape: ', shape);
    }

    reset() {
        this.updateFromFieldValues()
        this.attached = false;
        this.scale.x = 1;
        this.scale.y = 1;
        this.scale.z = 1;
        this.render();
    }

    //Collision bodys
    createBody(mass, friction, restitution) {
        const body = new Body({ mass: mass });
        const world = getWorld();
        body.material = new Material({ friction: friction, restitution: restitution});
        body.allowSleep = true;
        if ('box' === this.bodyShape) {
            const shape = new Box(new Vec3(this.size.x * 0.5,
                                           this.size.y * 0.5,
                                           this.size.z * 0.5))//cannon size is defined from the center
            body.sleepSpeedLimit = 0.5;
            body.sleepTimeLimit = 0.2;
            body.addShape(shape);

        }
        if ('sphere' === this.bodyShape) {
            const shape = new Sphere(this.radius);
            body.sleepSpeedLimit = 1.2;
            body.sleepTimeLimit = 0.2;
            body.addShape(shape);
        }
        if ('cylinder' === this.bodyShape) {
            const radiusTop = this.size.x * 0.5;
            const radiusBottom = this.size.z * 0.5;
            const height = this.size.y;
            const numSegments = 12
            const shape = new Cylinder(radiusTop, radiusBottom, height, numSegments)
            body.sleepSpeedLimit = 0.5;
            body.sleepTimeLimit = 0.2;
            body.addShape(shape);
        }
        //body.allowSleep = false;
        body.position.copy(this.position);
        this.hasBody = true;
        this.mass = mass;
        this.body = body;
        this.body.name = this.name;
        //this.body.sleep();

        this.body.addEventListener('collide', (event) => {
            simObjectCollision(event);
        });
        this.updateCollisionBody();
        world.addBody(this.body);
    }

    updateCollisionBody() {
        this.body.position.copy(this.position);
        this.body.quaternion.copy(this.quaternion);
    }

    updateBody() {
        this.body.position.copy(this.position);
        this.body.quaternion.copy(this.quaternion);
    }

    updateMesh() {
        this.position.copy(this.body.position);
        this.quaternion.copy(this.body.quaternion);
    }

    addBodyToWorld() {
        const world = getWorld();
        world.addBody(this.body);
    }

    removeBodyFromWorld() {
        const world = getWorld();
        world.removeBody(this.body);
    }

    //Listeners for controls
    initTransformControl() {
        const controlObj = getControl();
        const scene = getScene();

        this.control = new TransformControls(controlObj.camera, controlObj.renderer.domElement);

        this.addTransformListeners()

        this.control.attach(this);
        scene.add(this.control);

        this.control.visible = false;
        this.control.enabled = this.control.visible;
    }

    addTransformListeners() {
        this.control.addEventListener('dragging-changed',(event) => this._draggingCanged(event));
        this.control.addEventListener('objectChange', () => this._objectChange());
        addListeners();
    }

    removeTransformListners() {
        this.control.removeEventListener('dragging-changed',(event) => this._draggingCanged(event));
        this.control.removeEventListener('objectChange', () => this._objectChange());
        removeListeners();
    }

    //callback for dragging-changed
    _draggingCanged(event) {
        const controlObj = getControl();
        controlObj.orbitControls.enabled = ! event.value;
    }

    //Interactions
    detachFromGripper(robot) {
        const scene = getScene();
        this.attached = false;
        this.control.enabled = true;
        scene.attach(this);
        this.updateMatrixWorld();
        this.addBodyToWorld();
        this.updateBody();
        this.body.wakeUp();
        this.body.updateInertiaWorld();
        console.log('> Object dropped!');
    }

    attachToGripper(robot) {
        const scene = getScene();
        const tcp = robot.tcp.object;
        this.attached = true;
        this.wasGripped = true;
        this.control.enabled = false;
        scene.remove(this.control);
        this.removeBodyFromWorld();
        tcp.attach(this);
        console.log('> Object gripped!');
    }
}
