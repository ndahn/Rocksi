import * as THREE from 'three';
//Drag controls for simObjects, Lukas
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import * as Blockly from 'blockly/core'
import { requestAF,
         getScene,
         getRobot } from '../scene';

import { createBody,
         removeBody,
         updateBodies,
         updateMeshes,
         getBody } from '../physics';

//import { updateSimObjectBlock } from '../../editor/blockly';

// TODO: Error checking!

let simObjects = [];

//container for storing simObject properties, deprecated
//x, y, z, rotX, rotY, rotZ, name, type, attached
/**export class SimObject {
    constructor() {
        this.name = undefined;
        this.type = 'cube';
        this.rotation = new THREE.Euler(0, 0, 0, 'XYZ');
        this.size = new THREE.Vector3(.5, .5, .5);
        this.position = new THREE.Vector3(5, 5, this.size.z * .5);
        this.attached = false;
        this.asleep = false;
        this.hasBody = false;
    }
}**/

export class SimObject extends THREE.Mesh {
    constructor() {
        super();
        this.name = undefined;
        this.type = 'cube';
        this.attached = false;
        this.asleep = false;
        this.hasBody = false;
    }
    rotation = new THREE.Euler(0, 0, 0, 'XYZ');
    size = new THREE.Vector3(.5, .5, .5);
    position = new THREE.Vector3(5, 5, this.size.z * .5);
}

//Functions for creating meshes
function stackSimObject(simObject) {
        for (let k = 0; k < simObjects.length; k++) {
            if (simObjects[k].name != simObject.name) {
                if (simObject.position.distanceTo(simObjects[k].position)
                    < (simObject.size.z * .5)) {

                    let zShift = simObjects[k].size.z;
                    simObject.position.z = simObject.position.z + zShift;
                }
            }
        }
    return simObject;
}

function createBoxMesh(simObject) {
    simObject.geometry = new THREE.BoxBufferGeometry( simObject.size.x,
                                                    simObject.size.y,
                                                    simObject.size.z,
                                                    10,
                                                    10);

    simObject.material = new THREE.MeshPhongMaterial({ color: randomColor() });
    return simObject;
}

function createCylinderMesh(simObject) {
    //ToDo:
    //change size and retun it
    //change orientation and return it
    simObject.geometry = new THREE.CylinderGeometry(.3,
                                                        0,
                                                        .5,
                                                        10);

    simObject.material = new THREE.MeshPhongMaterial({ color: randomColor() });
    return simObject;
}

//creates a three mesh from an simObject depending on simObject.type
function createMesh(simObject) {
    const scene = getScene();
    if (simObject.type === 'cube') {
        let shiftedSimObject = stackSimObject(simObject);
        simObject = shiftedSimObject;
        simObject = createBoxMesh(simObject);
    }

    if (simObject.type === 'cylinder') {
        let shiftedSimObject = stackSimObject(simObject);
        simObject = shiftedSimObject;
        simObject = createCylinderMesh(simObject);
    }
    scene.add(simObject);
    requestAF();
}

//Functions for simObjects

//removes the three mesh and creates a new one with the new type
export function changeSimObjectType(simObjectName, type) {
    const idx = getSimObjectIdx(simObjectName);
    const scene = getScene();
    simObjects[idx].type = type;
    scene.remove(simObjects[idx]);
    createMesh(simObjects[idx]);
}

//Changes the position of a simObject and calls moveMesh with the new position.
//Note that the movement of the mesh is not animated.
//It will pop out and in of existence.
//We don't need an animation at this point.
export function changeSimObjectPosition(simObject) {
    const idx = getSimObjectIdx(simObject.name);
    simObjects[idx].position.copy(simObject.position);
    requestAF();
}

export function changeSimObjectOrientation(simObject) {
    const idx = getSimObjectIdx(simObject.name);
    simObjects[idx].rotation.copy(simObject.rotation);
    requestAF();
}

//Takes an array of blockly block uuids and turns them into simObjects
//and the corresponding three mesh with the same name.
//To do this it looks for the uuid in the simObjects array and if returned
//undefined it will add a new simObject and call createMesh. I do not think
//looking for an undefined is a good design choice, but it is working as intended
export function addSimObjects(simObjectNames) {
    let workspace = Blockly.getMainWorkspace();
    let block;
    for (let i = 0; i < simObjectNames.length; i++) {
        if (simObjects.find(simObject => simObject.name === simObjectNames[i]) === undefined){
            let newSimObject = new SimObject;
            newSimObject.name = simObjectNames[i];
            block = workspace.getBlockById(newSimObject.name);
            simObjects.push(newSimObject);
            createMesh(newSimObject);
        }
    }
}


//Removes the simObject from the simObjects array and calls remMesh
//I need to implement some form of error checking here.
export function remSimObjects(simObjectsArray) {
    const scene = getScene();
    for (let i = 0; i < simObjectsArray.length; i++) {
        for (let k = 0; k < simObjects.length; k++) {
            if (simObjects[k].name == simObjectsArray[i].name) {
                if (simObjects[k].hasBody) {
                    removeBody(simObjects[k]);
                }
                scene.remove(simObjects[k]);
                //remMesh(simObjects[k]);
                simObjects.splice(k, 1);
                requestAF();
            }
        }
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

//Functions for gripping
export function detachFromGripper(simObject) {
    const scene = getScene();

    let body = getBody(simObject);
    body.wakeUp();
    simObject.attached = false;

    scene.attach(simObject);
    updateBodies([simObject]);
    //Update the body
    body.updateInertiaWorld();
    console.log('> Object dropped!');
}

export function attachToGripper(simObject) {
    const robot = getRobot();
    const tcp = robot.tcp.object;
    console.log('> Object gripped!');

    //this is only the case if the Blockly block was processed
    if (simObject.hasBody) {
        simObject.attached = true;
        let body = getBody(simObject);
        body.sleep();
        //For some unknown reason cannon does't dispatches this automaticly
        body.dispatchEvent('sleep');
        simObject.asleep = true;
        tcp.attach(simObject);

        updateBodies(getSimObjects());
    }
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
    return attached
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
function randomColor() {
    const hexDigits = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += hexDigits[Math.floor(Math.random() * 16)];
    }
    return color;
}
