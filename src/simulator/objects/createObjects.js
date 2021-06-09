import { BoxBufferGeometry,
         MeshPhongMaterial,
         CylinderGeometry,
         SphereGeometry,
         Vector3,
         Mesh,
         LoadingManager,
     Object3D } from 'three';

import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';

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
//Loader for gltf
function loadShaft() {

    const scene = getScene();
    let manager = new LoadingManager();
    const objLoader = new OBJLoader();
    objLoader.load('../../assets/models/simObject_shapes/shaft/tinker.obj', function(obj) {
        const material = new MeshPhongMaterial({ color: 0x00ff00 });
        obj.material = material;
        obj.position.copy(new Vector3(2, 2, 2));
        scene.add(obj);
    });
    //let mesh = new Mesh(tmp.children[0].geometry, material);
    return;
}



//Simple box shape
function createBoxMesh(simObject) {

    const geometry = new BoxBufferGeometry( simObject.size.x,
                                            simObject.size.y,
                                            simObject.size.z,
                                            10,
                                            10);

    const material = new MeshPhongMaterial({ color: simObject.colour });
    const mesh = new Mesh(geometry, material);
    //mesh.position.copy(simObject.spawnPosition);
    //mesh.setRotationFromEuler(simObject.spawnRotation);
    return mesh;
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

function createSphereMesh(simObject) {
    const mesh = new Mesh();
    mesh.geometry = new SphereGeometry( 0.5, 32, 32 );
    mesh.material = new MeshPhongMaterial({ color: simObject.colour });
    return mesh;
}

//
export function addGeometry(simObject) {
    switch (simObject.shape) {
        case 'cube':
            const cubeMesh = createBoxMesh(simObject);
            cubeMesh.name = simObject.name;
            simObject.add(cubeMesh);
            simObject.createBody('cube');
            break;
        case 'rock':
            const rockMesh = makeRock(50, simObject.size.z, simObject.colour);
            let center = new Vector3();
            simObject.geometry = rockMesh.geometry;
            simObject.material = rockMesh.material;
            simObject.geometry.computeBoundingBox();
            simObject.geometry.center();
            simObject.createBody('cube');
            break;
        case 'sphere':
            const sphereMesh = createSphereMesh(simObject);
            simObject.geometry = sphereMesh.geometry;
            simObject.material = sphereMesh.material;
            simObject.createBody('sphere');
            break;
        case 'shaft':
            //const shaftMesh =
             loadShaft();
            //simObject.geometry = shaftMesh.geometry;
            //simObject.material = new MeshPhongMaterial({ color: simObject.colour });
        default:
            console.error('Unknown SimObject shape: ', simObject.shape);
            break;
    }
}

//Adds the simObject
export function addSimObject(blockUUID, fieldValues, pickedColour, shape) {
    let simObject = new SimObject;
    simObject.name = blockUUID;
    simObject.shape = shape;
    if (fieldValues != undefined) {
        simObject.setFieldValues(fieldValues);
        simObject.updateFromFieldValues();
    }
    if (pickedColour != undefined) {
        simObject.colour = pickedColour;;
    }
    addGeometry(simObject);
    setSpawnPosition(simObject);
    simObject.addToScene();
    simObject.updateFieldValues();
    simObjects.push(simObject);
}

//Functions for positioning simObjects
//sets the spawnPosition depending on the shape
function setSpawnPosition(simObject) {
    switch (simObject.shape) {
        case 'cube':
            stackCubes(simObject);
            break;
        case 'rock':
            stackCubes(simObject);
            break;
        case 'sphere':
            placeSpheres(simObject);
            break;
        default:
            console.error('Unknown SimObject shape: ', simObject.shape);
            break;
    }
}

//stacks cubes, until there are no more cubes to stack
function placeSpheres(simObject){
    const shift = xyShiftSphere(simObject);
    if (shift > 0) {
        simObject.spawnPosition.x = simObject.spawnPosition.x + shift;
        return placeSpheres(simObject);
    } else { return; }
}

//calculates the amount of the shift for stackCubes
function xyShiftSphere(simObject) {
    let returnVal = 0;
    for (let k = 0; k < simObjects.length; k++) {
        if (simObject.spawnPosition.distanceTo(simObjects[k].spawnPosition)
                    < (simObject.geometry.radius)) {
            returnVal = simObject.geometry.radius;
        }
    }
    return returnVal;
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
    const intersections = raycaster.intersectObjects(simObjects, true);
    const intersected = intersections.length > 0;
    const workspace = Blockly.getMainWorkspace();
    if (intersected) {
        const intersectedSimObj = intersections[0].object.parent;
        if (intersectedSimObj.highlighted != intersected) {
            intersectedSimObj.highlight(intersected);
            workspace.highlightBlock(intersectedSimObj.name);
            const limit = simObjects.length;
            for (let i = 0; i < limit; i++) {
                if (intersectedSimObj.name != simObjects[i].name) {
                    simObjects[i].highlight(false);
                }
            }
        }
    } else {
        const limit = simObjects.length;
        for (let i = 0; i < limit; i++) {
            simObjects[i].highlight(false);
            workspace.highlightBlock(null);
        }
    }
}

export function setTCSimObjectsOnClick(raycaster) {
    const intersections = raycaster.intersectObjects(simObjects, true);
    const intersected = intersections.length > 0 && intersections[0].object.parent.highlighted;
    const scene = getScene();
    if (intersected) {
        const intersectedSimObj = intersections[0].object.parent;
        if (intersectedSimObj.control.visible != intersected) {
            if (intersectedSimObj.attached) {
                return;
            } else {
                intersectedSimObj.control.setMode('rotate');
                intersectedSimObj.control.visible = true;
                intersectedSimObj.control.enabled = true;
            }
        }
        const mode = intersectedSimObj.control.getMode();
        scene.remove(intersectedSimObj.control);
        if (mode == 'translate'){
            intersectedSimObj.control.setMode('rotate');
        }
        if (mode == 'rotate'){
            intersectedSimObj.control.setMode('translate');
        }
        scene.add(intersectedSimObj.control);

    } else {
        const limit = simObjects.length;
        for (let i = 0; i < limit; i++) {
            simObjects[i].control.visible = false;
            simObjects[i].control.enabled = false;
        }
    }
    requestAF();
}

//Switches the TransformControls of simobjects on and off and changes the mode.
/*export function setTCSimObjectsOnClick(raycaster) {
    const intersections = raycaster.intersectObjects(simObjects, true);
    const intersectedSimObj = intersections[0].parent;
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
}*/

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
