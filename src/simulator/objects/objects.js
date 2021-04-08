import * as THREE from 'three';
import { addMesh,
         remMesh,
         getMesh,
         moveMesh,
         rotMesh,
         addToTCP,
         remFromTCP } from '../scene';
import { createBody, updateBodys } from '../physics';

// TODO: Error checking!

//This is not finished right now. Using global variables is not a good practice.
let simObjects = [];

//container for storing simObject properties
//x, y, z, rotX, rotY, rotZ, name, type, attached
export class simObject {
    constructor() {
        this.name = 'default';
        this.type = 'cube';
        //this.position = new THREE.Vector3(3, 3, 0.25);
        this.x = 5;
        this.y = 5;
        this.z = 0;
        this.rotX = 0;
        this.rotY = 0;
        this.rotZ = 0;
        this.sizeX = .5;
        this.sizeY = .5;
        this.sizeZ = .5;
        this.attached = false;
    }
}

//Functions for creating meshes

//creates a three mesh from an simObject depending on simObject.type
function createMesh(simObject) {

    if (simObject.type === 'cube') {
        const cubeGeometry = new THREE.BoxBufferGeometry(simObject.sizeX * 10,
                                                         simObject.sizeY * 10,
                                                         simObject.sizeZ * 10,
                                                         10,
                                                         10);

        const cubeMaterial = new THREE.MeshPhongMaterial({ color: randomColor() });
        let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cubeMesh.castShadow = true;
        cubeMesh.position.x  = simObject.x;
        cubeMesh.position.y  = simObject.y;
        cubeMesh.position.z  = simObject.z + 0.25;
        cubeMesh.scale.x = 0.1;
        cubeMesh.scale.y = 0.1;
        cubeMesh.scale.z = 0.1;
        cubeMesh.name = simObject.name;
        addMesh(cubeMesh);

    }

    if (simObject.type === 'cylinder') {
        const cylinderGeometry = new THREE.CylinderBufferGeometry(simObject.sizeX,
                                                                  simObject.sizeY,
                                                                  simObject.sizeZ,
                                                                  10,
                                                                  10);

        const cylinderMaterial = new THREE.MeshPhongMaterial({ color: randomColor() });
        const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinderMesh.castShadow = true;
        cylinderMesh.position.x  = simObject.x;
        cylinderMesh.position.y  = simObject.y;
        cylinderMesh.position.z  = simObject.z;
        cylinderMesh.name = simObject.name;
        addMesh(cylinderMesh);
    }
}

//Functions for simObjects

//removes the three mesh and creates a new one with the new type
export function changeSimObjectType(simObjectName, type) {
    const idx = getSimObjectIdx(simObjects, simObjectName);
    simObjects[idx].type = type;
    remMesh(simObjects[idx]);
    createMesh(simObjects[idx]);
}

//Changes the position of a simObject and calls moveMesh with the new position.
//Note that the movement of the mesh is not animated.
//It will pop out and in of existence.
//We don't need an animation at this point.
export function changeSimObjectPosition(simObject) {
    const idx = getSimObjectIdx(simObjects, simObject.name);
    simObjects[idx].x = simObject.x;
    simObjects[idx].y = simObject.y;
    simObjects[idx].z = simObject.z;
    moveMesh(simObjects[idx]);
    updateBodys([simObjects[idx]])
}

export function changeSimObjectOrientation(simObject) {
    const idx = getSimObjectIdx(simObjects, simObject.name);
    simObjects[idx].rotX = simObject.rotX;
    simObjects[idx].rotY = simObject.rotY;
    simObjects[idx].rotZ = simObject.rotZ;
    rotMesh(simObjects[idx]);
    updateBodys([simObjects[idx]])
}

//Takes an array of blockly block uuids and turns them into simObjects
//and the corresponding three mesh with the same name.
//To do this it looks for the uuid in the simObjects array and if returned
//undefined it will add a new simObject and call createMesh. I do not think
//looking for an undefined is a good desing choice, but it is working as intended
export function addSimObjects(simObjectNames) {
    for (let i = 0; i < simObjectNames.length; i++) {
        if (simObjects.find(object => object.name === simObjectNames[i]) === undefined){
            let newSimObject = new simObject;
            newSimObject.name = simObjectNames[i];
            simObjects.push(newSimObject);
            createMesh(newSimObject);
            createBody(newSimObject);
        }
    }
}

//Removes the simObject from the simObjects array and calls remMesh
//I need to implement some form of error checking here.
export function remSimObjects(simObjectNames) {
    for (let i = 0; i < simObjectNames.length; i++) {
        for (let k = 0; k < simObjects.length; k++) {
            if (simObjects[k].name == simObjectNames[i]) {
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
    simObjects.forEach(simObject => simObjectsNames.push(simObject.name));
    return simObjectsNames
}

//Returns all simObjects
export function getSimObjects() {
        return simObjects
}

//Returns the simObject by name (the uuid of the blockly block)
export function getSimObject(simObjectName) {
        const idx = getSimObjectIdx(simObjects, simObjectName);
        return simObjects[idx]
}

//Returns the index of a simObject in the simObjects array
//I need to implement some form of error checking here.
function getSimObjectIdx(simObjects, simObjectName) {
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].name == simObjectName) return i;
    }
}

//Functions for gripping

export function detachFromGripper(mesh) {
    console.log('> Object dropped!');
    getSimObject(mesh.name).attached = false;
    remFromTCP(mesh);
}

export function attachToGripper(mesh) {
    console.log('> Object gripped!');
    getSimObject(mesh.name).attached = true;
    addToTCP(mesh);
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
