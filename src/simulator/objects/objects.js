import * as THREE from 'three';
import { addMesh,
         remMesh,
         getMesh,
         moveMesh,
         rotMesh } from '../scene';

// TODO: Error checking!

//This is not finished right now. Using global variables is not a good practice.
let simObjects = [];

//container for storing simObject properties
export class simObject {
    constructor(x, y, z, rotX, rotY, rotZ, name, type) {
        this.name = 'default';
        this.type = 'cube';
        this.x = 5;
        this.y = 5;
        this.z = 0.5;
        this.rotX = 0;
        this.rotY = 0;
        this.rotZ = 0;
        this.sizeX = 1;
        this.sizeY = 1;
        this.sizeZ = 1; 
    }
}

//creates a three mesh from an simObject depending on simObject.type
function createMesh(simObject){
    //random colors for fancy cubes
    function randomColor() {
        const hexDigits = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += hexDigits[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    if(simObject.type === 'cube'){
        const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1, 10, 10);
        const cubeMaterial = new THREE.MeshPhongMaterial({ color: randomColor() });
        const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cubeMesh.castShadow = true;
        cubeMesh.position.x  = getRandomInt(10);
        cubeMesh.position.y  = getRandomInt(10);
        cubeMesh.position.z  = simObject.z;
        cubeMesh.name = simObject.name;
        addMesh(cubeMesh);
    }

    if(simObject.type === 'cylinder'){
        const cylinderGeometry = new THREE.CylinderBufferGeometry(1, 1, 1, 10, 10);
        const cylinderMaterial = new THREE.MeshPhongMaterial({ color: randomColor() });
        const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinderMesh.castShadow = true;
        cylinderMesh.position.x  = getRandomInt(10);
        cylinderMesh.position.y  = getRandomInt(10);
        cylinderMesh.position.z  = 0.5;
        cylinderMesh.name = simObject.name;
        addMesh(cylinderMesh);
    }
}

//removes the three mesh and creates a new one with the new type
export function changeSimObjectType(simObjectName, type){
    const idx = getSimObjectIdx(simObjects, simObjectName);
    simObjects[idx].type = type;
    remMesh(simObjects[idx]);
    createMesh(simObjects[idx]);
}

//Changes the position of a simObject and calls moveMesh with the new position.
//Note that the movement of the mesh is not animated.
//It will pop out and in of existence.
//We don't need an animation at this point.
export function changeSimObjectPosition(simObject){
    const idx = getSimObjectIdx(simObjects, simObject.name);
    simObjects[idx].x = simObject.x;
    simObjects[idx].y = simObject.y;
    simObjects[idx].z = simObject.z;
    moveMesh(simObjects[idx]);
}

export function changeSimObjectOrientation(simObject){
    const idx = getSimObjectIdx(simObjects, simObject.name);
    simObjects[idx].rotX = simObject.rotX;
    simObjects[idx].rotY = simObject.rotY;
    simObjects[idx].rotZ = simObject.rotZ;
    rotMesh(simObjects[idx]);
}

//Takes an array of blockly block uuids and turns them into simObjects
//and the corresponding three mesh with the same name.
//To do this it looks for the uuid in the simObjects array and if returned
//undefined it will add a new simObject and call createMesh. I do not think
//looking for an undefined is a good desing choice, but it is working as intended
export function addSimObjects(simObjectNames){
    for(let i = 0; i < simObjectNames.length; i++){
        if(simObjects.find(object => object.name === simObjectNames[i]) === undefined){
            let newSimObject = new simObject;
            newSimObject.name = simObjectNames[i];
            simObjects.push(newSimObject);
            createMesh(newSimObject);
        }
    }
}

//Removes the simObject from the simObjects array and calls remMesh
//I need to implement some form of error checking here.
export function remSimObjects(simObjectNames){
    for(let i = 0; i < simObjectNames.length; i++){
        for(let k = 0; k < simObjects.length; k++){
            if(simObjects[k].name == simObjectNames[i]){
                remMesh(simObjects[k]);
                simObjects.splice(k, 1);
            }
        }
    }
}

//Returns a list with all names of simObjects (the uuids of the blockly blocks)
//currently in the simObjects array
//I need to implement some form of error checking here.
export function getSimObjectsNames(){
    let simObjectsNames = [];
    simObjects.forEach(simObject => simObjectsNames.push(simObject.name));
    return simObjectsNames
}

export function getSimObject(simObjectName){
        const idx = getSimObjectIdx(simObjects, simObjectName);
        return simObjects[idx]
}

//Returns the index of a simObject in the simObjects array
//I need to implement some form of error checking here.
function getSimObjectIdx(simObjects, simObjectName){
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].name == simObjectName) return i;
    }
}

//Random integers. They are essential.
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
