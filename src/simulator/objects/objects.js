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
         getBody,
         bedTimeManagement } from '../physics';

import * as CANNON from 'cannon-es'

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
        this.movable = true;
        this.initPosition = new THREE.Vector3(5, 5, this.size.z * .5);
        this.body = null;
    }
    size = new THREE.Vector3(.5, .5, .5);
    position = new THREE.Vector3(5, 5, this.size.z * .5);

    render() {
        requestAF();
    }

    createBody() {
        const shape = new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25))
        const body = new CANNON.Body({ mass: 5 })
        body.addShape(shape)
        body.position.set(this.position)
        body.allowSleep = true;
        body.sleepSpeedLimit = 0.1;
        body.sleepTimeLimit = 0.5;

        body.addEventListener("sleep", function(e){
            bedTimeManagement(e);
        });

        body.addEventListener("wakeup", function(e){
            bedTimeManagement(e);
        });
        body.name = this.name;
        this.hasBody = true;
        this.body = body;
    }

    updateBody() {
        if (this.hasBody) {
            this.body.position.copy(this.position);
            this.body.quaternion.copy(this.quaternion);
        }
    }

    updateMesh() {
        if (this.hasBody) {
            this.position.copy(this.body.position);
            this.quaternion.copy(this.body.quaternion);
        }
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
    simObject.render();
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


//Takes an array of blockly block uuids and turns them into simObjects
//and the corresponding three mesh with the same name.
//To do this it looks for the uuid in the simObjects array and if returned
//undefined it will add a new simObject and call createMesh. I do not think
//looking for an undefined is a good design choice, but it is working as intended
export function addSimObject(simObjectName, changeInitPos = false, inputChild = undefined) {
    let newSimObject = new SimObject;
    newSimObject.name = simObjectName;
    if (changeInitPos == true) {
        newSimObject.position.x = inputChild.getFieldValue('X');
        newSimObject.position.y = inputChild.getFieldValue('Y');
        newSimObject.position.z = inputChild.getFieldValue('Z') + newSimObject.size.z * 0.5;
        let rx = inputChild.getFieldValue('ROLL') * .017;
        let ry = inputChild.getFieldValue('PITCH') * .017;
        let rz = inputChild.getFieldValue('YAW') * .017;
        newSimObject.setRotationFromEuler(new THREE.Euler(rx, ry, rz));
    }
    simObjects.push(newSimObject);
    createMesh(newSimObject);
}


//Removes the simObject from the simObjects array and from the threejs scene
export function remSimObjects(blocklyWorkspace) {
    const scene = getScene();
    let simObjectBlocksIds = [];
    let simObjectsToKeep = [];
    let i;
    const simObjectBlocks = blocklyWorkspace.getBlocksByType('add_sim_object');
    simObjectBlocks.forEach((block) => {
        simObjectBlocksIds.push(block.id);});

    //removes all
    if (simObjectBlocksIds.length == 0) {
        for (i = 0; i < simObjects.length; i++) {
            if (simObjects[i].hasBody) {
                removeBody(simObjects[i]);
            }
            scene.remove(simObjects[i]);
        }
        simObjects = [];
    }

    else if (simObjectBlocksIds.length != 0){
        for (i = 0; i < simObjects.length; i++) {
            for (let k = 0; k < simObjectBlocksIds.length; k++) {
                if (simObjectBlocksIds[k] == simObjects[i].name) {
                    simObjectsToKeep.push(simObjects[i]);
                }
            }
        }

        for (i = 0; i < simObjects.length; i++) {
            if (simObjects[i].hasBody) {
                removeBody(simObjects[i]);
            }
            scene.remove(simObjects[i]);
        }
        simObjects = simObjectsToKeep;
        for (i = 0; i < simObjects.length; i++) {
            scene.add(simObjects[i]);
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
