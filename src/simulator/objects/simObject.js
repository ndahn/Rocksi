/**
Class for the object interaction
**/
import { Vector3,
         Euler,
         Object3D,
         Box3,
         Plane,
         AxesHelper,
         MeshPhongMaterial,
         Quaternion,
         PlaneHelper,
         ArrowHelper } from 'three';

import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import { requestAF,
         getScene,
         getRobot,
         getControl } from '../scene';

import { getWorld,
         updateBodies } from '../physics';

import { addSimObject,
         remSimObjects,
         addGeometry,
         remControledSimObject } from './createObjects'

import { Box,
         Vec3,
         Body,
         Material,
         ConvexPolyhedron,
         Sphere,
         Cylinder } from 'cannon-es'

import * as Blockly from 'blockly/core'
import { canHover } from '../../helpers';

export class SimObject extends Object3D {
    constructor() {
        super();
        this.name = undefined;
        this.type = 'simObject'; //not used, set for development purposes
        this.shape = 'cube'; //default
        this.attached = false; //for the gripper interaction
        this.hasBody = false;
        this.body = undefined;
        this.checkBox = undefined;
        this.checkSphere = undefined;
        this.control = undefined;
        this._fieldValues = [5, 0, 0, 0, 0, 0];
        this.color = '#eb4034' //light orange, default fallback color
        this.highlighted = false;
        this.bodyShape = 'box';
        this.radius = 0;
        this.mass = 0;
        this.size = new Vector3(0.5, 0.5, 0.5);
        this.scaleFactor = 1;
        this.grippable = true;
        this.grippableAxisIndependent = true;
        this.gripAxes = [];
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
            const checkBox = new Box3().setFromObject(this);
            const floor = new Plane(new Vector3(0, 0, 1));
            const distance = floor.distanceToPoint(this.position);
            if (floor.intersectsBox(checkBox)) {
                this.control.enabled = false;
                this.position.z = this.position.z + 0.001
                return this._objectChange();

            } else if (distance < 0) {
                this.position.z = 0;
                this.control.enabled = false;
                return this._objectChange();
            }
            else {
                this.control.enabled = true;
                return;
            }
        }
    }

    //Use with caution, sets z-position until not intersecting with the floor.
    _floorCollision() {
        const checkBox = new Box3().setFromObject(this);
        const floor = new Plane(new Vector3(0, 0, 1));
        const distance = floor.distanceToPoint(this.position);
        if (floor.intersectsBox(checkBox)) {
            this.position.z = this.position.z + 0.001
            return this._floorCollision();

        } else if (distance < 0) {
            this.position.z = 0;
            return this._floorCollision();
        }
        else {
            return;
        }
    }

    //Updates the attachted pose block.
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
    render() { requestAF(); }//It is better to use the method provided by the simulator.

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

        if (this.hasBody) { world.removeBody(this.body); }
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
        this.visible = true;
        this.render();
    }

    hide() {
        const scene = getScene();
        scene.remove(this.control);
        this.setTransformControlEnabled(false);
        this.visible = false;
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

    setScale(scale) {
        this.scaleFactor = scale;
        this.scale.set(scale, scale, scale);
        this.children[0].geometry.computeBoundingBox();
        this.children[0].geometry.boundingBox.getCenter();
        this.children[0].geometry.center();
        const size = new Vector3();
        const tmpBox = new Box3().setFromObject(this);
        tmpBox.getSize(size);

        this.size.copy(size);
        this.createBody(0.5 * scale, 2, 0.1);
        this.setGrippable();
        this.setGripAxes();
        this._floorCollision();
        this.updateFieldValues();
        this.updatePoseBlock();
        this.render();
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
        remControledSimObject();
        this.addToScene();
        console.log('Changed to shape: ', shape);
    }

    reset() {
        this.updateFromFieldValues()
        this.attached = false;
        this.removeBodyFromWorld()
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
                    const sphere = new Sphere(this.radius * this.scaleFactor );
                    body.sleepSpeedLimit = 1.2;
                    body.sleepTimeLimit = 0.2;
                    body.addShape(sphere);
                }
                break;

            case 'cylinder':
                { // scoping variables
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
                const shape = new Box(new Vec3(this.size.x * 0.5,
                                               this.size.y * 0.5,
                                               this.size.z * 0.5))
                body.sleepSpeedLimit = 0.5;
                body.sleepTimeLimit = 0.2;
                body.addShape(shape);
            }
        }

        this.hasBody = true;
        this.mass = mass;
        this.body = body;
        this.body.name = this.name;
        this.body.sleep();
        this.updateBody();
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
        this.control.setSize(canHover() ? 1.25 : 2.5);

        this.control.addEventListener('dragging-changed', evt => this._draggingCanged(evt));
        this.control.addEventListener('objectChange', () => this._objectChange());

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
        scene.attach(this);
        this.attached = false;
        this.control.enabled = true;
        this.addBodyToWorld();
        this.updateBody();
        this.body.wakeUp();
        this.body.updateInertiaWorld();
        console.log('> Object dropped!');
    }

    attachToGripper(robot) {
        this.removeBodyFromWorld();
        const scene = getScene();
        const tcp = robot.tcp.object;
        this.attached = true;
        this.wasGripped = true;
        this.control.enabled = false;
        scene.remove(this.control);
        tcp.attach(this);
        this.updateBody();/* this is important, i dont know why
                            updateBody has to be the last thing to be executed...*/
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
        const play = 0.2
        const upperLimit = 0.8//(robot.hand.movable[0].limit.upper * robot.modelScale * 2) + play; //Two finger grippers only

        this.size.toArray(sizeArray);
        if ((Math.max(...sizeArray)) * this.scaleFactor <= upperLimit) {
            this.grippable = true;
            this.grippableAxisIndependent = true;

        } else if ((Math.min(...sizeArray)) * this.scaleFactor <= upperLimit) {
            this.grippable = true;
            this.grippableAxisIndependent = false;

        } else {
            this.grippable = false;
            this.grippableAxisIndependent = false;
        }
        //console.log('simObject ', this.name, 'is grippable: ', this.grippable);
        //console.log('simObject ', this.name, 'is grippable on any axis: ', this.grippableAxisIndependent);
    }

    setGripAxes() {
        const sizeArray = [];
        const axisArray = [0, 0, 0];
        this.gripAxes = [];
        this.size.toArray(sizeArray);
        const min = Math.min(...sizeArray);
        const max = Math.max(...sizeArray);
        let maxIdx;
        let minIdx;

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

        this.gripAxes.push(axis);
    }

    checkGripperOrientation(robot) {
        let returnVal = false;

        //const scene = getScene();

        //hand position for distCheck
        const hand = robot.hand.links[0];
        const handPos = new Vector3();
        hand.getWorldPosition(handPos);

        //tcp position and orientation for the axes
        const tcp = robot.tcp.object;
        const tcpPos = new Vector3();
        const tcpQuat = new Quaternion();
        tcp.getWorldPosition(tcpPos);
        tcp.getWorldQuaternion(tcpQuat);
        const zAxisTCP = new Vector3(0, 0, 1);
        zAxisTCP.applyQuaternion(tcpQuat);
        zAxisTCP.normalize();

        const fingerNormal = new Vector3(0, 1, 0); /*A vector that is normal
                                                    to the plane of the fingertip*/
        const leftFinger = robot.hand.movable[0];
        let fingerQuat = new Quaternion();
        leftFinger.getWorldQuaternion(fingerQuat);
        fingerNormal.applyQuaternion(fingerQuat);
        fingerNormal.normalize();

        //Same for the simObject
        let simQuat = new Quaternion();
        let gripAxis = new Vector3().copy(this.gripAxes[0]);
        this.getWorldQuaternion(simQuat);
        gripAxis.applyQuaternion(simQuat);
        gripAxis.normalize();

        //Human readable angles...
        let xi = this._radToDeg(gripAxis.angleTo(zAxisTCP));

        let tau = this._radToDeg(gripAxis.angleTo(fingerNormal));

        console.log('Angle gripAxis to zAxisTCP, xi, (green to yellow)', xi);
        console.log('Angle gripAxis to fingerNormal, tau, (green to pink)', tau);

        //distance check
        let distance = this.position.distanceTo(tcpPos);
        let distCheck = true;//distance >= tcpPos.distanceTo(handPos);

        if (75 < tau && tau < 115) { // check aginst the normal of the fingertip
            if (0 < xi && xi < 15) { //check against the z-axis of the tcp

                if (distCheck) {
                    returnVal = true;
                    console.log('can grip');
                } else {
                    returnVal = false;
                    console.log('can not grip');
                }
            }
            else if (170 < xi && xi < 185) { //check against the z-axis of the tcp
                if (distCheck) {
                    returnVal = true;
                    console.log('can grip');
                } else {
                    returnVal = false;
                    console.log('can not grip');
                }
            } else {
                returnVal = true;
                console.log('can grip');
            }

        } else {
            returnVal = false;
            console.log('can not grip');
        }
        return returnVal;
    }
}
