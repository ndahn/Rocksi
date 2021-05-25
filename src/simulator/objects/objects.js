import * as THREE from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import * as Blockly from 'blockly/core'
import { requestAF,
         getScene,
         getRobot,
         getControl } from '../scene';

import { getWorld } from '../physics';

import * as CANNON from 'cannon-es'

let simObjects = [];

export class SimObject extends THREE.Mesh {
    constructor() {
        super();
        this.name = undefined;
        this.type = 'cube';
        this.attached = false;
        this.asleep = false;
        this.hasBody = false;
        this.movable = true;
        this.spawnPosition = new THREE.Vector3(5, 0, this.size.z * .5);
        this.spawnRotation = new THREE.Euler(0, 0, 0);
        this.body = undefined;
        this.control = null;
    }
    size = new THREE.Vector3(.5, .5, .5);

    _checkPosition() {

    }

    render() {
        requestAF();
    }

    makeVisible() {
        const scene = getScene();
        scene.add(this.control);
        scene.add(this);
        this.render();
    }

    hide() {
        const scene = getScene();
        scene.remove(this.control);
        scene.remove(this);
        this.render();
    }

    createBody() {
        let body;
        if ('cube' == this.type) {
            const shape = new CANNON.Box(new CANNON.Vec3(0.251, 0.251, 0.251))
            body = new CANNON.Body({ mass: 0.01 })
            body.addShape(shape)
        }
        body.material = new CANNON.Material({ friction: 4, restitution: -1});
        body.position.set(this.position)
        body.allowSleep = true;
        body.sleepSpeedLimit = 0.2;
        body.sleepTimeLimit = 0.2;
        body.name = this.name;
        this.hasBody = true;
        this.body = body;
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

    add() {
        const scene = getScene();
        scene.add(this);
        this.initTransformControl();
        this.render();
    }

    initTransformControl() {
        const controlObj = getControl();
        const scene = getScene();

        this.control = new TransformControls(controlObj.camera, controlObj.renderer.domElement);
        this.control.addEventListener('change', render => {
            //Sometimes the controls are not visible, but they will change the position/rotation.
            //this is here to counter this behaviour
            if (!this.control.visible) {
                this.position.copy(this.spawnPosition);
                this.setRotationFromEuler(this.spawnRotation);
            }
            this.render()
        });

        this.control.addEventListener('dragging-changed', (event) => {
            controlObj.orbitControls.enabled = ! event.value;
        });

        this.control.addEventListener('objectChange', () => {
            if (this.control.visible) {
                if (this.position.z < 0) { this.position.z = this.size.z * .5; }

                this.spawnPosition.copy(this.position);
                this.spawnRotation.copy(this.rotation);
            }

        });

        this.control.attach(this);
        scene.add(this.control);

        this.control.visible = false;
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
        this.material = new THREE.MeshPhongMaterial({ color: colour });
    }

    update() {

    }

    changeType(type) {
        this.update();
    }

    reset() {
        if (this.hasBody) {
            const world = getWorld();
            world.removeBody(this.body);
        }
        this.position.copy(this.spawnPosition);
        this.setRotationFromEuler(this.spawnRotation);
        this.updateBody();
        this.render();
    }

    detachFromGripper() {
        const scene = getScene();
        this.attached = false;
        scene.attach(this);
        scene.add(this.control);
        this.addBodyToWorld();
        this.updateBody();
        this.body.wakeUp();
        this.body.updateInertiaWorld();
        console.log('> Object dropped!');
    }

    attachToGripper() {
        const robot = getRobot();
        const scene = getScene();
        const tcp = robot.tcp.object;
        this.attached = true;
        scene.remove(this.control);
        this.removeBodyFromWorld();
        tcp.attach(this);
        //This is important, otherwise the 3D-object will not attach correctly.
        this.updateBody();
        console.log('> Object gripped!');
    }
}

//Functions for creating meshes
function stackSimObject(simObject) {
        for (let k = 0; k < simObjects.length; k++) {
            if (simObjects[k].name != simObject.name) {
                if (simObject.spawnPosition.distanceTo(simObjects[k].spawnPosition)
                    < (simObject.size.z * .5)) {

                    let zShift = simObjects[k].size.z;
                    simObject.spawnPosition.z = simObject.spawnPosition.z + zShift;
                }
            }
        }
    return simObject;
}

function createBoxMesh(simObject, colour) {
    simObject.geometry = new THREE.BoxBufferGeometry( simObject.size.x,
                                                    simObject.size.y,
                                                    simObject.size.z,
                                                    10,
                                                    10);

    simObject.material = new THREE.MeshPhongMaterial({ color: colour });
    return simObject;
}

function createCylinderMesh(simObject, colour) {
    simObject.geometry = new THREE.CylinderGeometry(.3,
                                                        0,
                                                        .5,
                                                        10);

    simObject.material = new THREE.MeshPhongMaterial({ color: colour });
    return simObject;
}

//creates a three mesh from an simObject depending on simObject.type
function createMesh(simObject, colour) {
    if (simObject.type === 'cube') {
        let shiftedSimObject = stackSimObject(simObject);
        simObject = shiftedSimObject;
        simObject = createBoxMesh(simObject, colour);
    }

    if (simObject.type === 'cylinder') {
        let shiftedSimObject = stackSimObject(simObject);
        simObject = shiftedSimObject;
        simObject = createCylinderMesh(simObject, colour);
    }
}

//Functions for simObjects
export function addSimObject(blockUUID, inputChild, colourChild) {
    let newSimObject = new SimObject;
    newSimObject.name = blockUUID;
    if (inputChild != undefined) {
        newSimObject.spawnPosition.x = inputChild.getFieldValue('X');
        newSimObject.spawnPosition.y = inputChild.getFieldValue('Y');
        newSimObject.spawnPosition.z = inputChild.getFieldValue('Z') + newSimObject.size.z * 0.5;
        let rx = inputChild.getFieldValue('ROLL') * .017;
        let ry = inputChild.getFieldValue('PITCH') * .017;
        let rz = inputChild.getFieldValue('YAW') * .017;
        newSimObject.spawnRotation.copy(new THREE.Euler(rx, ry, rz));

    }
    if (colourChild != undefined) {
        if (colourChild.type == 'colour_random') {
            var colour = randomColour();
            console.log('Colour: ',colour);
        }
        if (colourChild.type == 'colour_picker') {
            var colour = colourChild.getFieldValue('COLOUR');
            console.log('Colour: ',colour);
        }
    }

    createMesh(newSimObject, colour);
    newSimObject.position.copy(newSimObject.spawnPosition);
    newSimObject.setRotationFromEuler(newSimObject.spawnRotation);
    newSimObject.createBody();
    newSimObject.add();
    simObjects.push(newSimObject);
}


//Removes the simObject from the simObjects array and from the threejs scene
export function remSimObjects(ids) {
    for (const id of ids) {
        const deletedSimObject = simObjects.find(simObject => simObject.name === id);
        const idx = simObjects.findIndex(simObject => simObject.name === id);
        if (deletedSimObject != undefined) {
            deletedSimObject.remove();
            simObjects.splice(idx, 1);
        }
    }
}

export function resetAllSimObjects () {
    if (simObjects.length > 0) {
        for (const simObject of simObjects) {
            simObject.reset();
        }
    }
}

//transformControl event functions

//Called by mousemove in scene.js
export function setTCSimObjects(raycaster) {
    const intersections = raycaster.intersectObjects(simObjects);
    const intersected = intersections.length == 1;
    const workspace = Blockly.getMainWorkspace();
    if (intersected) {
        console.log('intersections.length', intersections.length);

        if (intersections[0].object.control.visible != intersected) {
            intersections[0].object.control.visible = intersected;
            const colour = intersections[0].object.material.color.getHex();
            intersections[0].object.material.emissive.setHex(colour);
            intersections[0].object.render();
            //Highlights the corresponding Blockly block.
            workspace.highlightBlock(intersections[0].object.name);
        }
    } else {
        for (const simObject of simObjects) {
            simObject.control.visible = false;
            simObject.material.emissive.setHex(0x000000);
            simObject.render();
            //Switches the highlighting of the corresponding Blockly block off.
            workspace.highlightBlock(null);
        }
    }
}

//Called by onClick in scene.js
export function setTCSimObjectsOnClick(raycaster) {
    const intersections = raycaster.intersectObjects(simObjects);
    const scene = getScene();
    for (let intersect of intersections) {
        const mode = intersect.object.control.getMode();
        scene.remove(intersect.object.control);
        if (mode == 'translate'){
            intersect.object.control.setMode('rotate');
        }
        if (mode == 'rotate'){
            intersect.object.control.setMode('translate');
        }
        scene.add(intersect.object.control);
        intersect.object.render();
    }
}


//Returns a list with all names of simObjects (the uuids of the blockly blocks)
//currently in the simObjects array
//I need to implement some form of error checking here.
export function getSimObjectsNames() {
    let simObjectsNames = [];
    simObjects.forEach(simObject => {simObjectsNames.push(simObject.name)});
    return simObjectsNames
}

//Returns all simObjects
export function getSimObjects() {
    let returnVal = undefined;
    if (simObjects.length > 0) {
        returnVal = simObjects;
    }
    return returnVal;
}

//Returns the simObject by name (the uuid of the blockly block)
export function getSimObject(simObjectName) {
    let returnVal = undefined;
        for (let i = 0; i < simObjects.length; i++) {
            if (simObjectName == simObjects[i].name) { returnVal = simObjects[i]; }
        }
     return returnVal;
}

//Returns the index of a simObject in the simObjects array
export function getSimObjectIdx(simObjectName) {
    let returnVal = undefined;
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].name == simObjectName){ returnVal = i; }
    }
    return returnVal;
}

export function getSimObjectByPos(position, accuracy) {
    let returnVal = undefined;
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].position.distanceTo(position) <= accuracy) {
            returnVal = simObjects[i];
        }
    }
    return returnVal;
}

//Determin if a simobject is attached to the TCP
export function isAttached() {
    let attached = false;
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].attached == true) { attached = true; }
    }
    return attached;
}

//Return the first attached simObject
export function getAttachedObject() {
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].attached == true) { return simObjects[i] }
    }
}

//Utils
//Random integers. They are essential.
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

//random colors for fancy cubes
export function randomColour() {
    const hexDigits = '0123456789ABCDEF';
    let colour = '#';
    for (let i = 0; i < 6; i++) {
        colour += hexDigits[Math.floor(Math.random() * 16)];
    }
    return colour;
}
