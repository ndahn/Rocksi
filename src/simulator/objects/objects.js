import { BoxBufferGeometry,
         MeshPhongMaterial,
         CylinderGeometry,
         Vector3 } from 'three';

import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import * as Blockly from 'blockly/core'

import { SimObject } from './simObject'

import { makeRock } from './rock'

import { requestAF,
         getScene,
         getRobot,
         getControl } from '../scene';

import { getWorld } from '../physics';

let simObjects = [];

//Functions for creating meshes
//Simple box shape
function createBoxMesh(simObject) {
    const geometry = new BoxBufferGeometry( simObject.size.x,
                                            simObject.size.y,
                                            simObject.size.z,
                                            10,
                                            10);

    const material = new MeshPhongMaterial({ color: simObject.colour });
    return [geometry, material];
}

//Simple cylinder
function createCylinderMesh(simObject) {
    simObject.geometry = new CylinderGeometry(.3,
                                                    0,
                                                        .5,
                                                        10);

    simObject.material = new MeshPhongMaterial({ color: simObject.colour });
    return [geometry, material];
}

//
function addGeometry(simObject) {
    switch (simObject.type) {
        case 'cube':
            const cubeMesh = createBoxMesh(simObject);
            simObject.geometry = cubeMesh[0];
            simObject.material = cubeMesh[1];
            simObject.createBody('box');
            break;
        case 'rock':
            const rockMesh = makeRock(50, simObject.size.z * 2, simObject.colour);
            rockMesh.geometry.computeBoundingBox();
            simObject.geometry.copy(rockMesh.geometry);
            simObject.material = rockMesh.material;
            simObject.updateMatrixWorld();
            simObject.createBody('box');
            break;

        default:
            console.error('Unknown SimObject Type: ', simObject.type);
            break;
    }
}

//Adds the simObject
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
    newSimObject.add();
    newSimObject.updateFieldValues();
    simObjects.push(newSimObject);
}

//Functions for positioning simObjects
//sets the spawnPosition depending on the type
function setSpawnPosition(simObject) {
    switch (simObject.type) {
        case 'cube':
            stackCubes(simObject);
            break;
        case 'rock':
            stackCubes(simObject);
            break;

        default:
            console.error('Unknown SimObject Type: ', simObject.type);
            break;
    }
}

//stacks cubes, until there are no more cubes to stack
function stackCubes(simObject){
    const shift = zShiftCubes(simObject);
    if (shift > 0) {
        simObject.spawnPosition.z = simObject.spawnPosition.z + shift;
        return stackCubes(simObject);
    } else { return; }
}

//calculates the amount of the shift for stackCubes
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
    }
}

//Does what it says
export function resetAllSimObjects () {
    if (simObjects.length > 0) {
        for (const simObject of simObjects) {
            simObject.reset();
        }
    }
}

//transformControl event functions
//Lights simObjects on mouseover, is called in scene.js by mouseover
export function setSimObjectHighlight(raycaster) {
    const intersections = raycaster.intersectObjects(simObjects);
    const intersected = intersections.length > 0;
    const workspace = Blockly.getMainWorkspace();
    if (intersected) {
        if (intersections[0].object.highlighted != intersected) {
            intersections[0].object.highlighted = intersected;
            const colour = intersections[0].object.material.color.getHex();
            intersections[0].object.material.emissive.setHex(colour);
            intersections[0].object.render();
            //Highlights the corresponding Blockly block.
            workspace.highlightBlock(intersections[0].object.name);
            for (const simObject of simObjects) {
                if (intersections[0].object.name != simObject.name) {
                    simObject.highlighted = false;
                    simObject.material.emissive.setHex(0x000000);
                    simObject.render();
                }
            }
        }
    } else {
        for (const simObject of simObjects) {
            simObject.highlighted = false;
            simObject.material.emissive.setHex(0x000000);
            simObject.render();
            //Switches the highlighting of the corresponding Blockly block off.
            workspace.highlightBlock(null);
        }
    }
}

//Switches the TransformControls of simobjects on and off and changes the mode.
export function setTCSimObjectsOnClick(raycaster) {
    const intersections = raycaster.intersectObjects(simObjects);
    const intersected = intersections.length > 0 && intersections[0].object.highlighted;
    const scene = getScene();
    if (intersected) {
        if (intersections[0].object.control.visible != intersected) {
            if (intersections[0].object.attached) {
                return;
            } else {
                intersections[0].object.control.setMode('rotate');
                intersections[0].object.control.visible = true;
                intersections[0].object.control.enabled = true;
            }
        }
        const mode = intersections[0].object.control.getMode();
        scene.remove(intersections[0].object.control);
        if (mode == 'translate'){
            intersections[0].object.control.setMode('rotate');
        }
        if (mode == 'rotate'){
            intersections[0].object.control.setMode('translate');
        }
        scene.add(intersections[0].object.control);

    } else {
        for (const simObject of simObjects) {
            simObject.control.visible = false;
            simObject.control.enabled = false;
        }
    }
    requestAF();
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

//Returns the simObject to a corresponding threejs world position, with given accuracy
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
//Random integers. They are essential. Not uesed right now.
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

//random colours for fancy cubes
export function randomColour() {
    const hexDigits = '0123456789ABCDEF';
    let colour = '#';
    for (let i = 0; i < 6; i++) {
        colour += hexDigits[Math.floor(Math.random() * 16)];
    }
    return colour;
}
