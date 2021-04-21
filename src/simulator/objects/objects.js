import * as THREE from 'three';
import * as Blockly from 'blockly/core'
import { addMesh,
         remMesh,
         getMesh,
         moveMesh,
         rotMesh,
         addToTCP,
         remFromTCP } from '../scene';
import { createBody,
         removeBody,
         updateBodies,
         updateMeshes,
         getBody } from '../physics';

//import { updateSimObjectBlock } from '../../editor/blockly';

// TODO: Error checking!

//This is not finished right now. Using global variables is not a good practice.
let simObjects = [];

//container for storing simObject properties
//x, y, z, rotX, rotY, rotZ, name, type, attached
export class SimObject {
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
//creates a three mesh from an simObject depending on simObject.type
function createMesh(simObject) {

    if (simObject.type === 'cube') {
        let cubeGeometry = new THREE.BoxBufferGeometry( simObject.size.x,
                                                        simObject.size.y,
                                                        simObject.size.z,
                                                        10,
                                                        10);

        let cubeMaterial = new THREE.MeshPhongMaterial({ color: randomColor() });
        let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        //cubeMesh.castShadow = true;
        let shiftedSimObject = stackSimObject(simObject);
        simObject = shiftedSimObject;
        cubeMesh.position.copy(simObject.position);
        cubeMesh.rotation.copy(simObject.rotation);
        //Monkeypatching...
        cubeMesh.name = simObject.name;
        updateSimObjectBlock(simObject);
        addMesh(cubeMesh);

    }

    if (simObject.type === 'cylinder') {
        const cylinderGeometry = new THREE.CylinderBufferGeometry(simObject.size.x,
                                                                  simObject.size.y,
                                                                  simObject.size.z,
                                                                  10,
                                                                  10);

        const cylinderMaterial = new THREE.MeshPhongMaterial({ color: randomColor() });
        const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        //cylinderMesh.castShadow = true;
        let shiftedSimObject = stackSimObject(simObject);
        simObject = shiftedSimObject;
        cylinderMesh.position.copy(simObject.position);
        cylinderMesh.rotation.copy(simObject.rotation);
        cylinderMesh.name = simObject.name;
        addMesh(cylinderMesh);
    }
}

//Functions for simObjects

//removes the three mesh and creates a new one with the new type
export function changeSimObjectType(simObjectName, type) {
    const idx = getSimObjectIdx(simObjectName);
    simObjects[idx].type = type;
    remMesh(simObjects[idx]);
    createMesh(simObjects[idx]);
}

//Changes the position of a simObject and calls moveMesh with the new position.
//Note that the movement of the mesh is not animated.
//It will pop out and in of existence.
//We don't need an animation at this point.
export function changeSimObjectPosition(simObject) {
    const idx = getSimObjectIdx(simObject.name);
    simObjects[idx].position.copy(simObject.position);
    //updateBodies([simObjects[idx]])
    moveMesh(simObjects[idx]);

}

export function changeSimObjectOrientation(simObject) {
    const idx = getSimObjectIdx(simObject.name);
    simObjects[idx].rotation.copy(simObject.rotation);
    //updateBodies([simObjects[idx]])
    rotMesh(simObjects[idx]);
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
            newSimObject.position.x = block.getFieldValue('POSITION_X');
            newSimObject.position.y = block.getFieldValue('POSITION_Y');
            newSimObject.position.z = block.getFieldValue('POSITION_Z');
            simObjects.push(newSimObject);
            createMesh(newSimObject);
        }
    }
}


//Removes the simObject from the simObjects array and calls remMesh
//I need to implement some form of error checking here.
export function remSimObjects(simObjectsArray) {
    for (let i = 0; i < simObjectsArray.length; i++) {
        for (let k = 0; k < simObjects.length; k++) {
            if (simObjects[k].name == simObjectsArray[i].name) {
                if (simObjects[k].hasBody) {
                    removeBody(simObjects[k]);
                }
                remMesh(simObjects[k]);
                simObjects.splice(k, 1);
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
export function detachFromGripper(mesh) {
    console.log('> Object dropped!');
    let simObject = getSimObject(mesh.name)
    let body = getBody(simObject);
    body.wakeUp();
    simObject.attached = false;
    simObject.position.copy(mesh.position);
    remFromTCP(mesh);
    updateBodies([simObject]);
    //Update the body
    body.updateInertiaWorld();
}

export function attachToGripper(mesh) {
    console.log('> Object gripped!');
    let simObject = getSimObject(mesh.name)
    //this is only the case if the Blockly block was processed
    if (simObject.hasBody) {
        simObject.attached = true;
        let body = getBody(simObject);
        body.sleep();
        //For some unknown reason cannon does't dispatches this automaticly
        body.dispatchEvent('sleep');
        simObject.asleep = true;
        addToTCP(mesh);
        updateBodies(getSimObjects());
    }

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

function updateSimObjectBlock(simObject) {
    let workspace = Blockly.getMainWorkspace();
    let block = workspace.getBlockById(simObject.name);
    block.setFieldValue(simObject.position.x, 'POSITION_X');
    block.setFieldValue(simObject.position.y, 'POSITION_Y');
    block.setFieldValue(simObject.position.z, 'POSITION_Z');
}
