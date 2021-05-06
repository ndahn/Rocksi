//cannon-es import
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { getSimObjects,
         getSimObject } from './objects/objects';

//Physics setup
//variables for the physics simulation
const dt = 0.02
let world;
let robotBodies = [];
let initDone = false;

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
    initDone = true;
    console.log('Physics init done!');
}

export function getWorld() {
    if (initDone) {
        return world;
    }
    else {
        console.error('Physics not ready!');
    }
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

export function addBodyToWorld(simObject) {
    world.addBody(simObject.body)
}

export function removeBodyFromWorld(simObject) {
        world.removeBody(simObject.body)
        simObject.body = null;
}

//Removes every body, not used right now.
export function removeAllBodies(simObjects) {
    for (var i = 0; i < simObjects.length; i++) {
        removeBodyFromWorld(simObjects[i]);
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
