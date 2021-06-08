import { BoxBufferGeometry,
         MeshPhongMaterial,
         CylinderGeometry,
         Mesh,
         Vector3,
         Euler } from 'three';

import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import { requestAF,
         getScene,
         getRobot,
         getControl,
         addListeners,
         removeListeners } from '../scene';

import { getWorld } from '../physics';

import { addSimObject,
         remSimObjects,
         addGeometry } from './createObjects'

import { Box,
         Vec3,
         Body,
         Material } from 'cannon-es'

import * as Blockly from 'blockly/core'

const debug = true;

export class SimObject extends Mesh {
    constructor() {
        super();
        this.name = undefined;
        this.type = 'simObject';
        this.shape = 'cube'; //default
        this.attached = false;
        this.hasBody = false;
        this.spawnPosition = new Vector3(5, 0, this.size.z * .5);
        this.spawnRotation = new Euler(0, 0, 0);
        this.body = undefined;
        this.control = undefined;
        this._fieldValues = this._calcFieldValues();
        this.colour = '#eb4034'
        this.highlighted = false;
        if (debug) {
            console.log('simObject debug mode on!',);
        }

    }
    size = new Vector3(.5, .5, .5);

    _calcFieldValues() {
        let fieldValues = [];
        let radValues = [];

        this.spawnPosition.toArray(fieldValues);
        fieldValues[2] = fieldValues[2] - this.size.z * .5;
        this.spawnRotation.toArray(radValues);

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

    setSpawnPosition() {
        this.spawnPosition.copy(this.position);
        this.spawnRotation.copy(this.rotation);
        this._fieldValues = this._calcFieldValues();
    }

    _fieldValuesToPos(fieldValues) {
        let posArray = [];
        let eulArray = [];
        for (let i = 0; i < 3; i++) {
            posArray.push(fieldValues[i]);
            eulArray.push(parseFloat(this._degToRad(fieldValues[i + 3]).toFixed(3)));
        }

        for (let i = 0; i < 2; i++) {
            this.spawnPosition.setComponent(i, posArray[i]);
        }
        this.spawnPosition.setComponent(2, posArray[2] + this.size.z * .5);
        this.spawnRotation.fromArray(eulArray);
    }

    updateFromFieldValues() {
        this._fieldValuesToPos(this._fieldValues)
        this.updatePos(this.spawnPosition, this.spawnRotation);
    }

    updatePos(vector, euler)  {
        this.position.copy(vector);
        this.setRotationFromEuler(euler);
    }

    render() { requestAF(); }

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

    createBody(shape) {
        let body;
        if ('box' == shape) {
            const shape = new Box(new Vec3(this.size.x * 0.5,
                                           this.size.y * 0.5,
                                           this.size.z * 0.5))
            body = new Body({ mass: 0.01 })
            body.addShape(shape)
        }
        body.material = new Material({ friction: 4, restitution: -1});
        body.position.set(this.position)
        body.allowSleep = true;
        body.sleepSpeedLimit = 1.2;
        body.sleepTimeLimit = 0.2;
        body.name = this.name;
        this.hasBody = true;
        this.body = body;
        this.body.sleep();
        this.updateBody();
    }

    changeShape(shape) {
        this.shape = shape;
        addGeometry(this);
        this.render();
    }

    updateBody() {
        this.body.position.copy(this.position);
        this.body.quaternion.copy(this.quaternion);
    }

    updateMesh() {
        this.position.copy(this.body.position);
        this.quaternion.copy(this.body.quaternion);
    }

    add() {
        const scene = getScene();
        this.updatePos(this.spawnPosition, this.spawnRotation)
        scene.add(this);
        this.initTransformControl();
        this.updateMatrixWorld();
        this.render();
    }

    //callback for dragging-changed
    _draggingCanged(event) {
        const controlObj = getControl();
        controlObj.orbitControls.enabled = ! event.value;
    }

    //callback for objectChange
    _objectChange() {
        if (this.control.visible && !this.attached) {
            if (this.position.z < 0) { this.position.z = this.size.z * .5; }

            if (debug) {
                this.setSpawnPosition();
                this._updatePoseBlock();
            }
            this.render();
        }
    }

    _updatePoseBlock() {
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

    addBodyToWorld() {
        const world = getWorld();
        world.addBody(this.body);
    }

    removeBodyFromWorld() {
        const world = getWorld();
        world.removeBody(this.body);
    }

    remove() {
        const scene = getScene();
        const world = getWorld();

        if (this.hasBody) { world.removeBody(this.body); }
        if (this.isAttached) { scene.attach(this) }

        this.control.visible = true; //otherwise the renderer throws an error.
                                     //I suspect that threejs removes the
                                     //controls if visible is false.
        scene.remove(this.control);
        scene.remove(this);

        this.render();
    }

    setColour(colour) {
        this.material = new MeshPhongMaterial({ color: colour });
    }

    reset() {
        if (this.hasBody) {
            const world = getWorld();
            world.removeBody(this.body);
        }
        this.position.copy(this.spawnPosition);
        this.setRotationFromEuler(this.spawnRotation);
        this.attached = false;
        this.scale.x = 1;
        this.scale.y = 1;
        this.scale.z = 1;

        this.render();
    }

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
