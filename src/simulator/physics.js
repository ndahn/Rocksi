//cannon-es import
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
//tween
var TWEEN = require('@tweenjs/tween.js');

import { getSimObjects,
         getSimObject } from './objects/objects';

import { getMesh, addMesh } from './scene';

//Physics setup
//variables for the physics simulation
const dt = 0.02
let world;
let bodies = [];
let robotBodies = [];

/**
function updateRobotBodies() {

}

export function createRobotBody() {
    const shape = new CANNON.Box(new CANNON.Vec3(3, 3, 3));
    let body = new CANNON.Body({ mass: 0 });
    body.addShape(shape);
    body.position.set(new CANNON.Vec3(0, 0, 0));
    body.name = 'base';
    console.log(body.name);
    robotBodies.push(body);
    world.addBody(body);
}
**/

export function initCannon() {
    //World
    world = new CANNON.World();
    world.gravity.set(0, 0, -9.81);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 5;
    world.allowSleep = true;

    //Floor
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body({ mass: 0 });
    floorBody.addShape(floorShape);
    floorBody.quaternion.setFromEuler(0, 0, -Math.PI / 2);
    floorBody.allowSleep = true;
    floorBody.sleepSpeedLimit = 0.2;
    floorBody.sleepTimeLimit = 1;
    world.addBody(floorBody);
    console.log('Physics init done');
}

//physics update
export function updatePhysics() {
    const simObjects = getSimObjects();
    world.step(dt);
    updateMeshes(simObjects);
}

//handels sleep events, gets called by the bodys event listener.
export function bedTimeManagement(event){
    if (event.type == 'sleep') {

        let simObject = getSimObject(event.target.name);
        simObject.asleep = true;
    }
    if (event.type == 'wakeup') {

        let simObject = getSimObject(event.target.name);
        simObject.asleep = false;
    }
}

//deprecated
//only boxes right now
/**
export function createBody(simObject) {
    const shape = new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25))
    let body = new CANNON.Body({ mass: 5 })
    body.addShape(shape)
    body.position.set(simObject.position)
    body.name = simObject.name
    body.allowSleep = true;
    body.sleepSpeedLimit = 0.1;
    body.sleepTimeLimit = 0.5;

    body.addEventListener("sleep", function(e){
        bedTimeManagement(e);
    });

    body.addEventListener("wakeup", function(e){
        bedTimeManagement(e);
    });

    simObject.hasBody = true;
    bodies.push(body);
    world.addBody(body);
}

**/

/**
//deprecated
export function getBody(simObject) {
    let returnVal = undefined;
    for (let i = 0; i < bodies.length; i++) {
        if (bodies[i].name == simObject.name) {
            returnVal = bodies[i]
        }
    }
    return returnVal;
}
**/

export function addBody(simObject) {
    simObject.createBody();
    world.addBody(simObject.body)
}

export function removeBody(simObject) {
        world.removeBody(simObject.body)
        simObject.body = null;
}

//removes a body
/** deprecated
export function removeBody(simObject) {
    for (let i = 0; i !== bodies.length; i++) {
        if (bodies[i].name == simObject.name) {
            world.removeBody(bodies[i]);
            simObject.hasBody = false;
        }
    }
}
**/

//Removes every body, not used right now.
export function removeAllBodies(simObjects) {
    for (var i = 0; i < simObjects.length; i++) {
        removeBody(simObjects[i]);
    }
}

export function updateMeshes(simObjects) {
    for (let i = 0; i < simObjects.length; i++) {
        simObjects[i].updateMesh();
    }
}

export function updateBodies(simObjects) {
    for (let i = 0; i < simObjects.length; i++) {
        simObjects[i].updateBody();
    }
}

/** deprecated
//updates the bodies
export function updateBodies(simObjects) {
    if (bodies != undefined
        && simObjects != undefined
        && bodies.length == simObjects.length) {
        for (let k = 0; k < simObjects.length; k++) {
            for (let i = 0; i < simObjects.length; i++) {
                if (simObjects[k].name == bodies[i].name) {
                    bodies[i].position.copy(simObjects[k].position);
                    bodies[i].quaternion.copy(simObjects[k].quaternion);
                }
            }
        }
    }
}

//updates the meshes
export function updateMeshes(simObjects) {
    if (bodies != undefined
        && simObjects != undefined
        && bodies.length == simObjects.length) {
        for (let k = 0; k < simObjects.length; k++) {
            for (let i = 0; i < simObjects.length; i++) {
                if (simObjects[k].name == bodies[i].name) {
                    simObjects[k].position.copy(bodies[i].position);
                    simObjects[k].quaternion.copy(bodies[i].quaternion);
                }
            }
        }
    }
}
**/

//determins if all bodies are asleep
export function isAsleep() {
    let returnVal = true;
    const simObjects = getSimObjects();
    if (simObjects != undefined) {
        for (var i = 0; i < simObjects.length; i++) {
            if (simObjects[i].asleep == false) {
               returnVal = false;
               break;
            }
        }
    }
    else {returnVal = true;}

    return returnVal;
}
