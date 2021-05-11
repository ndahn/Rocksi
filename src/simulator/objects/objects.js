import { BoxBufferGeometry,
         MeshPhongMaterial,
         CylinderGeometry } from 'three';

<<<<<<< HEAD
<<<<<<< HEAD
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
=======
import * as CANNON from 'cannon-es'


let simObjects = [];

export class SimObject extends THREE.Mesh {
    constructor() {
        super();
        this.name = undefined;
        this.type = 'cube';
        this.attached = false;
        //this.asleep = false;
        this.hasBody = false;
        this.movable = true;
        this.spawnPosition = new THREE.Vector3(5, 5, this.size.z * .5);
        this.spawnRotation = new THREE.Euler(0, 0, 0);
        this.body = undefined;
    }
    size = new THREE.Vector3(.5, .5, .5);
    position = new THREE.Vector3(5, 0, this.size.z * .5);
>>>>>>> 7c6800e (Added cannon-es-debugger module. Bodys now have friction and a more adequate mass.)

import * as Blockly from 'blockly/core'
=======
    render() {
        requestAF();
    }

    createBody() {
        //place holder
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
        console.log(this.body);
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
        const world = getWorld();
        if (!this.hasBody) { this.createBody(); }
        if (this.hasBody && this.body != undefined) { world.addBody(this.body); }
        scene.add(this);
        this.render();
    }

    remove() {
        const scene = getScene();
        const world = getWorld();
        if (this.hasBody) { world.removeBody(this.body); }
        if (this.isAttached) { scene.attach(this) }
        scene.remove(this);
        this.render();
    }

    update() {

    }
>>>>>>> 8c318aa (Better performance loding, deleting and adding simObjects)

import { SimObject } from './simObject'

import { requestAF,
         getScene,
         getRobot,
         getControl } from '../scene';

import { getWorld } from '../physics';

let simObjects = [];

//Functions for creating meshes
function createBoxMesh(simObject) {
    const geometry = new BoxBufferGeometry( simObject.size.x,
                                            simObject.size.y,
                                            simObject.size.z,
                                            10,
                                            10);

    const material = new MeshPhongMaterial({ color: simObject.colour });
    return [geometry, material];
}

function createCylinderMesh(simObject) {
    simObject.geometry = new CylinderGeometry(.3,
                                                    0,
                                                        .5,
                                                        10);

    simObject.material = new MeshPhongMaterial({ color: simObject.colour });
    return [geometry, material];
}

function addGeometry(simObject) {
    switch (simObject.type) {
        case 'cube':
            const mesh = createBoxMesh(simObject);
            simObject.geometry = mesh[0];
            simObject.material = mesh[1];
            break;

        default:
            console.error('Unknown SimObject Type: ', simObject.type);
            break;
    }
}

<<<<<<< HEAD
export function addSimObject(blockUUID, fieldValues, pickedColour) {
    let newSimObject = new SimObject;
    newSimObject.name = blockUUID;
    console.log(pickedColour);
    if (fieldValues != undefined) {
        newSimObject.setFieldValues(fieldValues);
        newSimObject.updateFromFieldValues();
    }
    if (pickedColour != undefined) {
        newSimObject.colour = pickedColour;
        console.log(pickedColour);
    }
    addGeometry(newSimObject);
    setSpawnPosition(newSimObject);
    newSimObject.createBody();
    newSimObject.add();
    newSimObject.updateFieldValues();
    simObjects.push(newSimObject);
}
=======
//Functions for simObjects
export function addSimObject(simObjectName, changeSpawnPos = false, inputChild = undefined) {
    let newSimObject = new SimObject;
    newSimObject.name = simObjectName;
    if (changeSpawnPos == true && inputChild != undefined) {
        newSimObject.spawnPosition.x = inputChild.getFieldValue('X');
        newSimObject.spawnPosition.y = inputChild.getFieldValue('Y');
        newSimObject.spawnPosition.z = inputChild.getFieldValue('Z') + newSimObject.size.z * 0.5;
        let rx = inputChild.getFieldValue('ROLL') * .017;
        let ry = inputChild.getFieldValue('PITCH') * .017;
        let rz = inputChild.getFieldValue('YAW') * .017;
        newSimObject.spawnRotation.copy(new THREE.Euler(rx, ry, rz));
>>>>>>> 8c318aa (Better performance loding, deleting and adding simObjects)

//Functions for positioning simObjects
function setSpawnPosition(simObject) {
    switch (simObject.type) {
        case 'cube':
            stackCubes(simObject);
            break;

        default:
            console.error('Unknown SimObject Type: ', simObject.type);
            break;
    }
}

function stackCubes(simObject){
    const shift = zShiftCubes(simObject);
    if (shift > 0) {
        simObject.spawnPosition.z = simObject.spawnPosition.z + shift;
        return stackCubes(simObject);
    } else { return; }
}

function zShiftCubes(simObject) {
    let returnVal = 0;
    for (let k = 0; k < simObjects.length; k++) {
        if (simObject.spawnPosition.distanceTo(simObjects[k].spawnPosition)
                    < (simObject.size.z * .5)) {
            returnVal = simObject.size.z;
        }
    }
    return returnVal;
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
<<<<<<< HEAD
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
=======
>>>>>>> 8c318aa (Better performance loding, deleting and adding simObjects)
    }
}

<<<<<<< HEAD
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
=======
export function resetAllSimObjects () {
    if (simObjects.length > 0) {
        for (const simObject of simObjects) {
            simObject.reset();
        }
>>>>>>> 7c6800e (Added cannon-es-debugger module. Bodys now have friction and a more adequate mass.)
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
