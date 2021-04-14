<<<<<<< HEAD
import { BoxBufferGeometry,
         MeshPhongMaterial,
         CylinderGeometry } from 'three';
=======
import * as THREE from 'three';
import { addMesh,
         remMesh,
         getMesh,
         moveMesh,
         rotMesh,
         addToTCP,
         remFromTCP } from '../scene';
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
=======
import { createBody, updateBodys } from '../physics';
>>>>>>> 3862ed5 (Started to add physics to the simulation. Not really working right now. Object pickup is broken, in this commit. Objects only fall if you move the camera, this is intentional.)
=======
import { createBody, removeBody, updateBodies, updateMeshes } from '../physics';
>>>>>>> 7eccd06 (Work on the physics simulation. Some cleanup. Minor changes on the watchBlocks function in blockly.js)

import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import * as Blockly from 'blockly/core'

import { SimObject } from './simObject'

import { requestAF,
         getScene,
         getRobot,
         getControl } from '../scene';

import { getWorld } from '../physics';

let simObjects = [];

<<<<<<< HEAD
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

//Functions for positioning simObjects
function setSpawnPosition(simObject) {
    switch (simObject.type) {
        case 'cube':
            stackCubes(simObject);
            break;
=======
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
    }
}

//Functions for creating meshes

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
        cubeMesh.position.copy(simObject.position);
        cubeMesh.rotation.copy(simObject.rotation);
        cubeMesh.name = simObject.name;
        addMesh(cubeMesh);
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)

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

<<<<<<< HEAD
function zShiftCubes(simObject) {
    let returnVal = 0;
    for (let k = 0; k < simObjects.length; k++) {
        if (simObject.spawnPosition.distanceTo(simObjects[k].spawnPosition)
                    < (simObject.size.z * .5)) {
            returnVal = simObject.size.z;
        }
=======
    if (simObject.type === 'cylinder') {
        const cylinderGeometry = new THREE.CylinderBufferGeometry(simObject.size.x,
                                                                  simObject.size.y,
                                                                  simObject.size.z,
                                                                  10,
                                                                  10);

        const cylinderMaterial = new THREE.MeshPhongMaterial({ color: randomColor() });
        const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        //cylinderMesh.castShadow = true;
        cylinderMesh.position.copy(simObject.position);
        cylinderMesh.rotation.copy(simObject.rotation);
        cylinderMesh.name = simObject.name;
        addMesh(cylinderMesh);
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
    }
    return returnVal;
}

<<<<<<< HEAD
//Removes the simObject from the simObjects array and from the threejs scene
export function remSimObjects(ids) {
    for (const id of ids) {
        const deletedSimObject = simObjects.find(simObject => simObject.name === id);
        const idx = simObjects.findIndex(simObject => simObject.name === id);
        if (deletedSimObject != undefined) {
            deletedSimObject.remove();
            simObjects.splice(idx, 1);
=======
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
//looking for an undefined is a good desing choice, but it is working as intended
export function addSimObjects(simObjectNames) {
    for (let i = 0; i < simObjectNames.length; i++) {
        if (simObjects.find(object => object.name === simObjectNames[i]) === undefined){
            let newSimObject = new SimObject;
            newSimObject.name = simObjectNames[i];
            simObjects.push(newSimObject);
<<<<<<< HEAD
<<<<<<< HEAD
            createMesh(newSimObject);
<<<<<<< HEAD
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
=======
            createBody(newSimObject);
>>>>>>> 3862ed5 (Started to add physics to the simulation. Not really working right now. Object pickup is broken, in this commit. Objects only fall if you move the camera, this is intentional.)
=======
            createBody(newSimObject);
=======
            //createBody(newSimObject);
>>>>>>> fc4b4db (Fixed the wrong if/else loop in objects.js/getSimobject and objects.js/getSimObjectIdx functions. Some work on integrating the physics in simulation.js. Some cleanup in blockly.js)
            createMesh(newSimObject);
            //updateBodies(simObjects);

>>>>>>> 7eccd06 (Work on the physics simulation. Some cleanup. Minor changes on the watchBlocks function in blockly.js)
        }
    }
}

<<<<<<< HEAD
export function resetAllSimObjects () {
    if (simObjects.length > 0) {
        for (const simObject of simObjects) {
            simObject.reset();
=======
//Removes the simObject from the simObjects array and calls remMesh
//I need to implement some form of error checking here.
export function remSimObjects(simObjectsArray) {
    for (let i = 0; i < simObjectsArray.length; i++) {
        for (let k = 0; k < simObjects.length; k++) {
            if (simObjects[k].name == simObjectsArray[i].name) {
                remMesh(simObjects[k]);
                simObjects.splice(k, 1);
            }
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 24ac1b4 (Overhaul of the watchBlocks function in blockly.js. The gripper_close function in simulation.js works now as intended.)
    let returnVal = undefined;
    if (simObjects.length > 0) {
        returnVal = simObjects;
    }
    return returnVal;
<<<<<<< HEAD
=======
        return simObjects
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
=======
>>>>>>> 24ac1b4 (Overhaul of the watchBlocks function in blockly.js. The gripper_close function in simulation.js works now as intended.)
}

//Returns the simObject by name (the uuid of the blockly block)
export function getSimObject(simObjectName) {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    let returnVal = undefined;
        for (let i = 0; i < simObjects.length; i++) {
            if (simObjectName == simObjects[i].name) { returnVal = simObjects[i]; }
        }
     return returnVal;
}

//Returns the index of a simObject in the simObjects array
export function getSimObjectIdx(simObjectName) {
    let returnVal = undefined;
=======
        const idx = getSimObjectIdx(simObjects, simObjectName);
        return simObjects[idx]
}

//Returns the index of a simObject in the simObjects array
//I need to implement some form of error checking here.
function getSimObjectIdx(simObjects, simObjectName) {
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].name == simObjectName){ returnVal = i; }
=======
=======
    let returnVal = undefined;
>>>>>>> fc4b4db (Fixed the wrong if/else loop in objects.js/getSimobject and objects.js/getSimObjectIdx functions. Some work on integrating the physics in simulation.js. Some cleanup in blockly.js)
        for (let i = 0; i < simObjects.length; i++) {
            if (simObjectName == simObjects[i].name) { returnVal = simObjects[i]; }
        }
     return returnVal;
}

//Returns the index of a simObject in the simObjects array
export function getSimObjectIdx(simObjectName) {
    let returnVal = undefined;
    for (let i = 0; i < simObjects.length; i++) {
<<<<<<< HEAD
        if (simObjects[i].name == simObjectName) return i;
        else return undefined;
>>>>>>> 7eccd06 (Work on the physics simulation. Some cleanup. Minor changes on the watchBlocks function in blockly.js)
=======
        if (simObjects[i].name == simObjectName){ returnVal = i; }
>>>>>>> fc4b4db (Fixed the wrong if/else loop in objects.js/getSimobject and objects.js/getSimObjectIdx functions. Some work on integrating the physics in simulation.js. Some cleanup in blockly.js)
    }
    return returnVal;
}

<<<<<<< HEAD
export function getSimObjectByPos(position, accuracy) {
    let returnVal = undefined;
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].position.distanceTo(position) <= accuracy) {
            returnVal = simObjects[i];
        }
    }
    return returnVal;
=======
//Functions for gripping
export function detachFromGripper(mesh) {
    console.log('> Object dropped!');
    let simObject = getSimObject(mesh.name)
    simObject.attached = false;
    simObject.position.copy(mesh.position);
    remFromTCP(mesh);
    //createBody(simObject)
    //updateBodies([getSimObject(mesh.name)]);
}

export function attachToGripper(mesh) {
    console.log('> Object gripped!');
    let simObject = getSimObject(mesh.name)
    simObject.attached = true;
    //removeBody(simObject);
    addToTCP(mesh);
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
=======
    updateBodies([getSimObject(mesh.name)]);
>>>>>>> 7eccd06 (Work on the physics simulation. Some cleanup. Minor changes on the watchBlocks function in blockly.js)
=======
    //updateBodies([getSimObject(mesh.name)]);
>>>>>>> 24ac1b4 (Overhaul of the watchBlocks function in blockly.js. The gripper_close function in simulation.js works now as intended.)
}

//Determin if a simobject is attached to the TCP
export function isAttached() {
    let attached = false;
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].attached == true) { attached = true; }
<<<<<<< HEAD
=======
    }
    return attached
}

//Return the first attached simObject
export function getAttachedObject() {
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].attached == true) { return simObjects[i] }
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
    }
}

<<<<<<< HEAD
//Return the first attached simObject
export function getAttachedObject() {
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].attached == true) { return simObjects[i] }
    }
}

//Utils
=======
//Utils
<<<<<<< HEAD

>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
=======
>>>>>>> 7eccd06 (Work on the physics simulation. Some cleanup. Minor changes on the watchBlocks function in blockly.js)
//Random integers. They are essential.
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

//random colors for fancy cubes
<<<<<<< HEAD
export function randomColour() {
    const hexDigits = '0123456789ABCDEF';
    let colour = '#';
    for (let i = 0; i < 6; i++) {
        colour += hexDigits[Math.floor(Math.random() * 16)];
    }
    return colour;
=======
function randomColor() {
    const hexDigits = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += hexDigits[Math.floor(Math.random() * 16)];
    }
    return color;
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
}
