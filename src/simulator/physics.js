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

//const physicsTween = new TWEEN.Tween();



function doNothing(){
    console.log('Nothing done');
}

export function initCannon() {
    //World
    world = new CANNON.World();
    world.gravity.set(0, 0, -9);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    world.allowSleep = true;
    //world.addEventListener('sleepEvent', doNothing);

    //Floor
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body({ mass: 0 });
    floorBody.addShape(floorShape);
    floorBody.quaternion.setFromEuler(0, 0, -Math.PI / 2);
    world.addBody(floorBody);
    console.log('Physics init done');
}

//physics update
export function updatePhysics() {
    let simObjects = [];
    simObjects = getSimObjects();
    world.step(dt);
    updateMeshes(simObjects);
}

//only boxes right now
export function createBody(simObject) {
    const shape = new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25))
    let body = new CANNON.Body({ mass: 5 })
    body.addShape(shape)
    body.position.set(simObject.position)
    body.name = simObject.name
    //body.allowSleep = true;
    //body.sleepSpeedLimit = 0.1;
    //body.sleepTimeLimit = 1;

    //body.addEventListener("sleepy", function(e){
    //    console.log('Body', body.name, 'feels sleepy.' );
    //});

    //body.addEventListener("sleep", function(e){
    //    console.log('Body', body.name, 'is sleeping.' );
    //});

    console.log('Body added: ', body.name);
    bodies.push(body)
    world.addBody(body)
}

//removes a body
export function removeBody(simObject) {
    for (let i = 0; i !== bodies.length; i++) {
        if (bodies[i].name == simObject.name) {
            world.removeBody(bodies[i])
        }
        else { console.warn('No body removed') }
    }
}

//updates the bodies
export function updateBodies(simObjects) {
    let meshes = [];
    for (let i = 0; i <= simObjects.length; i++) {
        if (simObjects[i] != undefined) {
            meshes.push(getMesh(simObjects[i]));
        }
    }

    for (let i = 0; i !== meshes.length; i++) {
        for (let k = 0; k !== bodies.length; k++) {
            if (meshes[i].name == bodies[k].name) {
                bodies[k].position.copy(meshes[i].position)
                bodies[k].quaternion.copy(meshes[i].quaternion)
            }
        }
    }
}

//updates the meshes
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
                meshes[i].position.copy(bodies[k].position);
                meshes[i].quaternion.copy(bodies[k].quaternion);
            }
        }
    }
}
