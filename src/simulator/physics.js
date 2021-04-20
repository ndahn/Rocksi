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
    floorBody.allowSleep = true;
    floorBody.sleepSpeedLimit = 0.2;
    floorBody.sleepTimeLimit = 3;
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

//handels sleep events, gets called by the bodys event listener.
function bedTimeManagement(event){

    if (event.type == 'sleep') {
        console.log('Body', event.target.name, 'is sleeping.' );
        let simObject = getSimObject(event.target.name);
        simObject.asleep = true;
    }

    if (event.type == 'sleepy') {
        return;
    }

    if (event.type == 'wakeup') {
        console.log('Body ', event.target.name, ' is awake')
        let simObject = getSimObject(event.target.name);
        simObject.asleep = false;
    }
}


//only boxes right now
export function createBody(simObject) {
    const shape = new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25))
    let body = new CANNON.Body({ mass: 5 })
    body.addShape(shape)
    body.position.set(simObject.position)
    body.name = simObject.name
    body.allowSleep = true;
    body.sleepSpeedLimit = 0.1;
    body.sleepTimeLimit = 1;

    body.addEventListener("sleepy", function(e){
        bedTimeManagement(e);
    });
    body.addEventListener("sleep", function(e){
        bedTimeManagement(e);
    });

    body.addEventListener("wakeup", function(e){
        bedTimeManagement(e);
    });

    //body.addEventListener('wakeup', sleeping(event, body));

    console.log('Body added: ', body.name);
    simObject.hasBody = true;
    //body.sleep();
    bodies.push(body)
    world.addBody(body)
}

export function getBody(simObject) {
    let returnVal = undefined;
    for (var i = 0; i < bodies.length; i++) {
        if (bodies[i].name == simObject.name) {
            returnVal = bodies[i]
        }
    }
    return returnVal;
}

//removes a body
export function removeBody(simObject) {
    for (let i = 0; i !== bodies.length; i++) {
        if (bodies[i].name == simObject.name) {
            world.removeBody(bodies[i]);
            simObject.hasBody = false;
        }
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
    if (simObjects != undefined) {


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
}

//this is a bit of a mess...
let sleep = [];

export function isAsleep() {
    const simObjects = getSimObjects();
    //catch if there is something fishy in the simObjects array
    if (simObjects != undefined) {
        for (var i = 0; i < simObjects.length; i++) {
            if (simObjects[i].asleep) {
                console.log('simObjects[',i,'].asleep', simObjects[i].asleep);
                sleep.push('sleep');
            }
        }
        if (sleep.length == simObjects.length) {
            sleep = [];
            return true;
        }
        else {
            return false;
        }
    }
    else if (simObjects == undefined) {
        console.warn('You have broken the law, simObjects in isAsleep() are undefined!');
        //I think it is best then somthing is worng not to render, aka
        //we pretend that every body is asleep
        return true;
    }
}
