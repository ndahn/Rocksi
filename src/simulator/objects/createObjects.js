/**
This script handeles the 3D object addition
**/
import { BoxBufferGeometry,
         MeshPhongMaterial,
         CylinderGeometry,
         SphereGeometry,
         Vector3,
         Mesh,
         LoadingManager,
         Object3D,
         Box3,
         Euler,
         Quaternion,
         AxesHelper } from 'three';

import { Vec3 } from 'cannon-es';

import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

import * as Blockly from 'blockly/core';

import { SimObject } from './simObject';

import { makeRock } from './rock';

import { requestAF,
         getScene,
         getRobot,
         getControl } from '../scene';

import { getWorld } from '../physics';

//simObjects array
let simObjects = [];
//This stores the currently via the tranform controls controlled simObject
let controlledSimObject = undefined;

//Functions for creating meshes
//Simple box shape
function createBoxMesh(simObject) {
    const geometry = new BoxBufferGeometry( simObject.size.x,
                                            simObject.size.y,
                                            simObject.size.z,
                                            10,
                                            10);

    const material = new MeshPhongMaterial({ color: simObject.color });
    const mesh = new Mesh(geometry, material);
    return mesh;
}

//Simple cylinder
function createCylinderMesh(simObject) {
    const cylinderMesh = new Mesh();
    cylinderMesh.geometry = new CylinderGeometry(.3, 0, .5, 10);
    cylinderMesh.material = new MeshPhongMaterial({ color: simObject.colour });
    return cylinderMesh;
}
//Simple sphere
function createSphereMesh(simObject) {
    const mesh = new Mesh();
    mesh.geometry = new SphereGeometry( simObject.size.z * 0.5, 12, 12 );
    mesh.material = new MeshPhongMaterial({ color: simObject.colour });
    return mesh;
}

//Adds a geometry to a simObject.
export function addGeometry(simObject) {
    const size = new Vector3();
    const checkBox = new Box3();
    switch (simObject.shape) {
        case 'cube':
            simObject.size.copy(new Vector3(.4, .4, .4));
            const cubeMesh = createBoxMesh(simObject);
            simObject.bodyShape = 'box';
            simObject.add(cubeMesh);
            simObject.createBody(0.5, 2, 0.1);//mass, friction, restitution
            simObject.setGrippable();
            simObject.setGripAxes();
            break;

        case 'rock':
            const rockMesh = makeRock(50, simObject.size.z, simObject.colour);
            rockMesh.geometry.computeBoundingBox();
            rockMesh.geometry.center();
            checkBox.setFromObject(rockMesh);
            checkBox.getSize(size);
            simObject.bodyShape = 'box';
            simObject.size.copy(size);
            simObject.add(rockMesh);
            simObject.createBody(3, 2, 0.01);//mass, friction, restitution
            simObject.setGrippable();
            simObject.setGripAxes();
            break;

        case 'sphere':
            const sphereMesh = createSphereMesh(simObject);
            sphereMesh.geometry.computeBoundingSphere();
            sphereMesh.geometry.computeBoundingBox();
            checkBox.setFromObject(sphereMesh);
            checkBox.getSize(size);
            simObject.size.copy(size);
            simObject.radius = sphereMesh.geometry.boundingSphere.radius;
            simObject.bodyShape = 'sphere';
            simObject.add(sphereMesh);
            simObject.createBody(2.1, 1, 0.1);//mass, friction, restitution
            simObject.setGrippable();
            simObject.setGripAxes();
            break;

        case 'shaft':
            const assetPath = '/models/simObject_shapes/shaft/shaft.stl';
            const shape = 'cylinder';
            loadAssetSTL(simObject, assetPath, shape); //I have use the promise stuff here...
            break;

        case 'custom':
            loadUserFile(simObject);
            break;

        default:
            console.error('Unknown SimObject shape: ', simObject.shape);
            break;
    }
}

//Loads a 3D object from file.
function loadAssetSTL(simObject, assetPath, shape) {
    //const filePath = '/models/simObject_shapes/shaft/shaft.stl';
    const loader = new STLLoader();
    const size = new Vector3();
    loader.load(
        assetPath, (geometry) =>  {
        const material = new MeshPhongMaterial( { color: simObject.color} );
        const mesh = new Mesh( geometry, material );

        simObject.scaleFactor = 0.3;
        mesh.scale.copy(new Vector3(.03, .03, .03));

        mesh.geometry.computeBoundingBox();
        mesh.geometry.center();
        mesh.rotation.x = Math.PI/2;
        const tmpBox = new Box3().setFromObject(mesh);
        tmpBox.getSize(size);

        simObject.size.copy(size);
        simObject.add(mesh);

        simObject.bodyShape = shape;
        simObject.createBody(5, 2, 0.1);//mass, friction, restitution

        simObject.setGrippable();
        simObject.setGripAxes();

        simObject.render();
    });
}


function loadUserFile(simObject) {
    const upload = document.createElement('input');
    upload.setAttribute('type', 'file');
    upload.setAttribute('accept', '.stl,.obj,.mtl,.png,.jpg,.jpeg,.bmp');
    upload.setAttribute('multiple', 'true');  // allow .obj + .mtl + textures

    upload.onchange = (fileSelectedEvent) => {
        try {
            const files = Array.from(fileSelectedEvent.target.files);
            if (files.length === 0) return;

            const stlFile = files.find(f => f.name.toLowerCase().endsWith('.stl'));
            const objFile = files.find(f => f.name.toLowerCase().endsWith('.obj'));

            if (stlFile) {
                const reader = new FileReader();
                reader.addEventListener('load', (event) => {
                    loadSTL(simObject, event.target.result);
                });
                reader.readAsArrayBuffer(stlFile);
            }
            else if (objFile) {
                loadUserOBJ(simObject, files, objFile);
            }
            else {
                alert('Please select an .stl or .obj file (you can also include .mtl and texture files).');
            }
        }
        catch (e) { console.log(e); }
    }
    document.body.appendChild(upload);
    upload.click();
    document.body.removeChild(upload);
}


function loadUserOBJ(simObject, allFiles, objFile) {
    const mtlFile = allFiles.find(f => f.name.toLowerCase().endsWith('.mtl'));
    const textureFiles = allFiles.filter(f =>
        /\.(png|jpe?g|bmp)$/i.test(f.name)
    );
    const fileMap = {};
    allFiles.forEach(f => {
        fileMap[f.name] = URL.createObjectURL(f);
    });

    const manager = new LoadingManager();
    manager.setURLModifier((url) => {
        const filename = url.split('/').pop().split('\\').pop();
        if (fileMap[filename]) {
            return fileMap[filename];
        }
        return url;
    });

    const objReader = new FileReader();
    objReader.addEventListener('load', (event) => {
        const objText = event.target.result;

        if (mtlFile) {
            const mtlReader = new FileReader();
            mtlReader.addEventListener('load', (mtlEvent) => {
                const mtlText = mtlEvent.target.result;
                const mtlLoader = new MTLLoader(manager);
                const materials = mtlLoader.parse(mtlText);
                materials.preload();

                const objLoader = new OBJLoader(manager);
                objLoader.setMaterials(materials);
                const obj = objLoader.parse(objText);
                attachOBJToSimObject(simObject, obj);
            });
            mtlReader.readAsText(mtlFile);
        }
        else {
            const objLoader = new OBJLoader(manager);
            const obj = objLoader.parse(objText);

            const defaultMaterial = new MeshPhongMaterial({ color: simObject.color });
            obj.traverse((child) => {
                if (child.isMesh) {
                    child.material = defaultMaterial;
                }
            });
            attachOBJToSimObject(simObject, obj);
        }
    });
    objReader.readAsText(objFile);
}

function attachOBJToSimObject(simObject, obj) {
    const size = new Vector3();
    const rawBox = new Box3().setFromObject(obj);
    rawBox.getSize(size);
 
    const TARGET_SIZE = 1.0;
    const maxDim = Math.max(size.x, size.y, size.z);
 
    if (maxDim > 0 && isFinite(maxDim)) {
        const sf = TARGET_SIZE / maxDim;
        obj.scale.set(sf, sf, sf);
        simObject.scaleFactor = sf;
    } else {
        simObject.scaleFactor = 1;
    }
 
    obj.updateMatrixWorld(true);
    const scaledBox = new Box3().setFromObject(obj);
    const scaledCenter = new Vector3();
    scaledBox.getCenter(scaledCenter);
    scaledBox.getSize(size);
 
    obj.position.x -= scaledCenter.x;
    obj.position.y -= scaledCenter.y;
    obj.position.z -= scaledBox.min.z;
 
    simObject.size.copy(size);
 
    simObject.add(obj);
    simObject.bodyShape = 'box';
    simObject.createBody(5, 2, 0.1); 
    simObject.setGrippable();
    simObject.setGripAxes();
    simObject.render();
}

export function addSimObject(blockUUID, fieldValues, color, shape, scale) {

    let simObject = new SimObject;
    simObject.name = blockUUID;
    simObjects.push(simObject);
    simObject.shape = shape;
    simObject.color = color;

    addGeometry(simObject);

    if (fieldValues != undefined) {
        simObject.setFieldValues(fieldValues);
        simObject.updateFromFieldValues();
    } else {
        simObject.setFieldValues(simObject._fieldValues);
        simObject.updateFromFieldValues();
    }

    simObject.addToScene();

    if (scale != 1) {
        simObject.setScale(scale);
    }
    if (simObjects.length > 1) {
        place3Dobjects(simObject);
        simObject.updateFieldValues();
        simObject.updatePoseBlock();
    }
}

//Places 3D objects on top of each other.
export function place3Dobjects(simObject){
    const limit = simObjects.length;
    for (let k = 0; k < limit; k++) {
        if (simObjects[k].name != simObject.name){

            let box = new Box3().setFromObject(simObject);
            let checkBox = new Box3().setFromObject(simObjects[k]);
            let intersecting = true;

            while (intersecting) {
                simObject.position.z = simObject.position.z + 0.001;
                box.setFromObject(simObject);
                intersecting = box.intersectsBox(checkBox);
            }
        }
    }
}

//Removes the simObject from the simObjects array and from the threejs scene
export function remSimObjects(ids) {
    const limit = ids.length;
    for (let i = 0; i < limit; i++) {
        const deletedSimObject = getSimObject(ids[i]);
        const idx = getSimObjectIdx(ids[i]);
        if (deletedSimObject != undefined) {
            deletedSimObject.removeFromScene();
            simObjects.splice(idx, 1);
        }
    }
}

//transformControl event functions
//Lights simObjects on mouseover, is called in scene.js by mouseover
export function setSimObjectHighlight(raycaster) {
    if (controlledSimObject != undefined) {
        return;
    }

    const intersections = raycaster.intersectObjects(simObjects, true);
    const intersected = intersections.length > 0;
    const workspace = Blockly.getMainWorkspace();

    if (intersected) {

        const intersectedSimObj = intersections[0].object.parent;

        if (intersectedSimObj.highlighted != intersected) {
            const limit = simObjects.length;
            for (let i = 0; i < limit; i++) {
                simObjects[i].highlight(false);
            }

            intersectedSimObj.highlight(intersected);
            workspace.highlightBlock(intersectedSimObj.name);
        }
    } else {
        const limit = simObjects.length;
        for (let i = 0; i < limit; i++) {
            simObjects[i].highlight(false);
            workspace.highlightBlock(null);
        }
    }
}

//Changes controls on click.
export function setTCSimObjectsOnClick(raycaster) {
    const intersections = raycaster.intersectObjects(simObjects, true);
    const intersected = intersections.length > 0;

    if (intersected) {
        const intersectedSimObj = intersections[0].object.parent;

        if (intersectedSimObj === controlledSimObject) {
            const mode = intersectedSimObj.control.getMode();
            switch (mode) {
                case 'translate':
                    intersectedSimObj.control.setMode('rotate');
                    break;

                case 'rotate':
                default:
                    intersectedSimObj.control.setMode('translate');
            }

            return intersected;
        }

        if (controlledSimObject != undefined) {
            removeTransformControl(controlledSimObject);
        }

        activateTransformControl(intersectedSimObj);
        controlledSimObject = intersectedSimObj;
    }
    else if (controlledSimObject != undefined) {
        Blockly.getMainWorkspace().highlightBlock(null);
        controlledSimObject.highlight(false);
        removeTransformControl(controlledSimObject);
        controlledSimObject = undefined;
    }

    return intersected;
}

//Activates the TransformControls
function activateTransformControl(simObject) {
    simObject.control.setMode('translate');
    simObject.setTransformControlEnabled(true);

    getScene().add(simObject.control);
}

//Removes the TransformControls
function removeTransformControl(simObject) {
    getScene().remove(simObject.control);

    simObject.control.setMode('rotate');
    simObject.setTransformControlEnabled(false);
}

//Removes the controled simObject from the buffer.
export function remControledSimObject() {
    if (controlledSimObject) {
        removeTransformControl(controlledSimObject);
    }

    controlledSimObject = undefined;
}

//Functions for getting simObjects
//Retruns all names of simObjects in order in a array
export function getSimObjectsNames() {
    let simObjectsNames = [];
    const simObjectsLen = simObjects.length;
    for (let i = 0; i < simObjectsLen; i++) {
        simObjectsNames.push(simObject.name);
    }
    return simObjectsNames
}

//Returns simObjects array
export function getSimObjects() {
    return simObjects;
}

//Returns the simObject by name (the uuid of the blockly block)
export function getSimObject(simObjectName) {
    const simObject = simObjects.find(simObject =>
                                      simObject.name === simObjectName);
    return simObject;
}

//Returns the index of a simObject in the simObjects array
export function getSimObjectIdx(simObjectName) {
    const idx = simObjects.findIndex(simObject => simObject.name === simObjectName);
    return idx;
}

//Returns the simObject to a corresponding THREE.js world position
export function getSimObjectByPos(position) {
    let minDist = 9999.0;
    let minIdx = -1;
    let dist;

    const simObjectsLen = simObjects.length;
    for (let i = 0; i < simObjectsLen; i++) {
        dist = simObjects[i].position.distanceTo(position);
        if (dist <= minDist) {
            minDist = dist;
            minIdx = i;
        }
    }

    if (minIdx < 0) {
        return undefined;
    }

    const checkBox = new Box3().setFromObject(simObjects[minIdx]);
    if (checkBox.containsPoint(position)) {
        return simObjects[minIdx];
    }

    return undefined;
}

//Determin if a simobject is attached to the TCP
export function isAttached() {
    return !!getAttachedObject();
}

//Return the first attached simObject
export function getAttachedObject() {
    const limit = simObjects.length;
    for (let i = 0; i < limit; i++) {
        if (simObjects[i].attached) {
            return simObjects[i]
        }
    }
    return undefined;
}

//Utils
//Random integers. They are essential. Not uesed right now.
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

//Random colors for fancy cubes
export function randomColour() {
    const hexDigits = '0123456789ABCDEF';
    let colour = '#';
    for (let i = 0; i < 6; i++) {
        colour += hexDigits[Math.floor(Math.random() * 16)];
    }
    return colour;
}