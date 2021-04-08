//cannon-es import
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
//tween
var TWEEN = require('@tweenjs/tween.js');

import { getSimObjects } from './objects/objects';
import { getMesh, addMesh } from './scene';
//Physics setup

//variables for the physics simulation
const dt = 0.02
let world;
let bodies = [];
let cubeShape, cubeBody;

export function initCannon() {
    //World
    world = new CANNON.World();
    world.gravity.set(0, 0, -9);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;

    //Floor
    const floorShape = new CANNON.Plane()
    const floorBody = new CANNON.Body({ mass: 0 })
    floorBody.addShape(floorShape)
    floorBody.quaternion.setFromEuler(0, 0, -Math.PI / 2)
    world.addBody(floorBody)
    console.log('Physics init done');
}

export function updatePhysics() {
    let simObjects = [];
    simObjects = getSimObjects();
    world.step(dt);

    if (true) {
        //console.log('Drop it like its hot');
        //updateBodys(simObjects);
        updateMeshes(simObjects);
    }

}

export function createBody(simObject) {
    const cubeShape = new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25))
    cubeBody = new CANNON.Body({ mass: 5 })
    cubeBody.addShape(cubeShape)
    cubeBody.position.set(simObject.x, simObject.y, simObject.z)
    cubeBody.name = simObject.name
    console.log('cubeBody: ', cubeBody.name);
    bodies.push(cubeBody)
    world.addBody(cubeBody)
}

export function updateBodys(simObjects) {
    let meshes = [];

    for (let i = 0; i <= simObjects.length; i++) {
        if (simObjects[i] != undefined) {
            meshes.push(getMesh(simObjects[i]));
        }
    }

    for (let i = 0; i !== meshes.length; i++) {
        for (let k = 0; k !== bodies.length; k++) {

            if (meshes[i].name == bodies[k].name) {
                //console.log('Body: ',k ,bodies[k].name);
                //console.log('Mesh: ',i ,meshes[i].name);
                bodies[k].position.copy(meshes[i].position)
                bodies[k].quaternion.copy(meshes[i].quaternion)
            }
        }
    }
}

export function updateMeshes(simObjects) {
    let meshes = [];

    for (let i = 0; i <= simObjects.length; i++) {
        if (simObjects[i] != undefined) {
            meshes.push(getMesh(simObjects[i]));
        }
    }
    for (let i = 0; i !== meshes.length; i++) {
        for (let k = 0; k !== bodies.length; k++) {

            if (meshes[i].name === bodies[k].name) {
                console.log('up Mesh Body: ',k ,bodies[k].name);
                console.log('up Mesh Mesh: ',i ,meshes[i].name);
                meshes[i].position.copy(bodies[k].position);
                meshes[i].quaternion.copy(bodies[k].quaternion);
            }
        }
    }
}
