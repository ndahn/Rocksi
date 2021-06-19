import { Vector3,
         Euler,
         Object3D,
         AxesHelper,
         MeshPhongMaterial,
         Quaternion,
         Plane,
         PlaneHelper } from 'three';

import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import { requestAF,
         getScene,
         getRobot,
         getControl } from '../scene';

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

const debug = true;

export class SimObject extends Object3D {
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
        this.color = '#eb4034'
        this.highlighted = false;
        this.bodyShape = 'box';
        this.radius = 0;
        this.mass = 0;
        this.size = new Vector3(0.5, 0.5, 0.5);
        this.defaultScaleFactor = new Vector3(1, 1, 1);
        if (debug) {
          this.axesHelper = undefined;
        }
        this.grippable = true;
        this.grippableAxisIndependent = true;
        this.gripAxes = [];
        this.advancedGrippingOff = false;
    }

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


    //callback for objectChange
    _objectChange() {
        if (this.control.visible && !this.attached) {
            if (this.position.z < 0) {
                this.position.z = this.size.z * .5;
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
        //scene.add(this);
        this.visible = true;
        this.render();
    }

    hide() {
        const scene = getScene();
        scene.remove(this.control);
        this.setTransformControlEnabled(false);
        this.visible = false;
        //scene.remove(this);
        this.render();
    }

    highlight(status) {
        const limit = this.children.length;
        if (status) {
            for (let i = 0; i < limit; i++) {
                if (this.children[i].material.emissive != undefined) {
                    const colour = this.children[i].material.color.getHex();
                    this.children[i].material.emissive.setHex(colour);
                }
            }
            this.highlighted = status;
        } else if (!status) {
            for (let i = 0; i < limit; i++) {
                if (this.children[i].material.emissive != undefined) {
                    this.children[i].material.emissive.setHex(0x000000);
                }
            }
            this.highlighted = status;
        }
        this.render();
    }

    setColor(color) {
        const limit = this.children.length;
        const children = this.children;
        this.color = color;
        for (let i = 0; i < limit; i++) {
            children[i].material = new MeshPhongMaterial({ color: color });
        }
    }

    changeShape(shape) {
        this.shape = shape;
        const world = getWorld();
        this.removeFromScene();
        const limit = this.children.length;
        const children = this.children;
        for (let i = 0; i < limit; i++) {
            this.remove(children[i]);
        }
        world.removeBody(this.body);
        addGeometry(this);
        this.addToScene();
        console.log('Changed to shape: ', shape);
    }

    reset() {
        this.updateFromFieldValues()
        this.attached = false;
        const sf = this.defaultScaleFactor;
        this.scale.copy(sf);
        this.render();
    }

    //Collision bodys
    createBody(mass, friction, restitution) {
        const body = new Body({ mass: mass });
        const world = getWorld();
        body.material = new Material({ friction: friction, restitution: restitution});
        body.allowSleep = true;
        switch (this.bodyShape){
            case 'sphere':
                { // scoping variables
                    const sphere = new Sphere(this.radius);
                    body.sleepSpeedLimit = 1.2;
                    body.sleepTimeLimit = 0.2;
                    body.addShape(sphere);
                }
                break;

            case 'cylinder':
                { // scoping variables
                    console.log('Body size: ', this.size);
                    const radiusTop = this.size.x * 0.5;
                    const radiusBottom =  this.size.z * 0.5;
                    const height = this.size.y;
                    const numSegments = 12
                    const cylinder = new Cylinder(radiusTop, radiusBottom, height, numSegments)
                    body.sleepSpeedLimit = 0.5;
                    body.sleepTimeLimit = 0.2;
                    body.addShape(cylinder);
                }
                break;

            case 'box':
            default:
            {
                //cannon size is defined from the center
                const shape = new Box(new Vec3(this.size.x * 0.5, this.size.y * 0.5, this.size.z * 0.5))
                body.sleepSpeedLimit = 0.5;
                body.sleepTimeLimit = 0.2;
                body.addShape(shape);
            }
        }

        //body.allowSleep = false;
        //body.position.copy(this.position);
        this.hasBody = true;
        this.mass = mass;
        this.body = body;
        this.body.name = this.name;
        this.body.sleep();
        this.updateBody();
        world.addBody(this.body);
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
        this.control.setSize(controlObj.canHover ? 1.25 : 2.5);

        this.control.addEventListener('dragging-changed', evt => this._draggingCanged(evt));
        this.control.addEventListener('objectChange', () => this._objectChange);

        this.control.attach(this);
        scene.add(this.control);

        this.control.visible = false;
        this.control.enabled = this.control.visible;
    }

    setTransformControlEnabled(enabled) {
        this.control.enabled = enabled;
        this.control.visible = enabled;
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

    isGrippable() {
        return this.grippable;
    }

    isGrippableAxisIndependent() {
        return this.grippableAxisIndependent;
    }

    setGrippable() {
        const robot = getRobot();
        const sizeArray = [];
        const play = 0.01
        const upperLimit = (robot.hand.movable[0].limit.upper * robot.modelScale * 2) + play; //Two finger grippers only
        console.log('Upper limit gripper', upperLimit);
        console.log('this.size', this.size);
        this.size.toArray(sizeArray);
        if (Math.max(...sizeArray) <= upperLimit) {
            this.grippable = true;
            this.grippableAxisIndependent = true;
            console.log('condition 0', sizeArray);
        } else if (Math.min(...sizeArray) <= upperLimit) {
            this.grippable = true;
            this.grippableAxisIndependent = false;
            console.log('condition 1');
        } else {
            this.grippable = false;
            this.grippableAxisIndependent = false;
            console.log('condition 2');
        }
        console.log('The this ', this.name, 'is grippable', this.grippable);
        console.log('The this ', this.name, 'is grippable on any axis', this.grippableAxisIndependent);
    }

    setGripAxes() {
        const sizeArray = [];
        const axisArray = [0, 0, 0];
        this.gripAxes = []; //empty Vector3
        this.size.toArray(sizeArray);
        const min = Math.min(...sizeArray);
        const max = Math.max(...sizeArray);
        let maxIdx;
        let minIdx;
        console.log('min: ', min, 'max: ' , max);
        for (let i = 0; i < sizeArray.length; i++) {
            if (sizeArray[i] === max) {
                maxIdx = i;
            }
            if (sizeArray[i] === min) {
                minIdx = i;
            }
        }
        axisArray[maxIdx] = 1;
        const axis = new Vector3().fromArray(axisArray);
        console.log(axisArray);
        console.log(axis);
        this.gripAxes.push(axis);
    }

    checkGripperOrientation(robot) {
        console.log('Robot links: ', robot.links);
        let zAxisRobot = new Vector3(0, 0, 1);
        let tcpQuat = new Quaternion();
        let simQuat = new Quaternion();
        let gripAxis = this.gripAxes[0];

        tcp.getWorldQuaternion(tcpQuat);
        this.getWorldQuaternion(simQuat);

        zAxisRobot.applyQuaternion(tcpQuat);
        gripAxis.applyQuaternion(simQuat);

        zAxisRobot.normalize();
        checkPlane = new Plane();
    }
}


/*        let retrunVal = false;
        const tcp = robot.tcp.object;
        let xAxisRobot = new Vector3(1, 0, 0); //x direction
        let yAxisRobot = new Vector3(0, 1, 0);
        let zAxisRobot = new Vector3(0, 0, 1);
        let gripAxis = this.gripAxes[0];
        console.log(this.gripAxes[0]);
        let tcpQuat = new Quaternion();
        let simQuat = new Quaternion();

        tcp.getWorldQuaternion(tcpQuat);
        this.getWorldQuaternion(simQuat);

        yAxisRobot.applyQuaternion(tcpQuat);
        zAxisRobot.applyQuaternion(tcpQuat);
        gripAxis.applyQuaternion(simQuat);

        xAxisRobot.normalize();
        yAxisRobot.normalize();
        gripAxis.normalize();

        let dotProY = gripAxis.dot(yAxisRobot);
        let dotProZ = gripAxis.dot(zAxisRobot);

        dotProY = Math.abs(dotProY);
        dotProZ = Math.abs(dotProZ);

        console.log('dotProY: ', dotProY);
        console.log('dotProZ: ', dotProZ);

        if (dotProY < 1 && dotProY > 0.85 && dotProZ < 0.1) {
            retrunVal = false;
        } else {
            retrunVal = true;
        }

        return retrunVal;
    }*/
