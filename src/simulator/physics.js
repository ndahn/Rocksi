//cannon-es import
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
<<<<<<< HEAD
import { getSimObjects,
         getSimObject } from './objects/objects';
import { getScene } from './scene';
import cannonDebugger from 'cannon-es-debugger'
//Physics setup
//variables for the physics simulation
const dt = 0.02
let world;
let robotBodies = [];
let initDone = false;
const debugOn = false;

function debug() {
    if (debugOn) {
        const scene = getScene();
        cannonDebugger(scene, world.bodies);
    }
}

export function initRobotHitboxes(robot) {
    /**console.log('Robot: ', robot);
    const scene = getScene();
    const links = robot.arm.links;
    let i = 1;
    let linkWorldPosition = new THREE.Vector3();
    let linkWorldQuat = new THREE.Vector2();
    for (const link of links) {
		link.getWorldPosition(linkWorldPosition);
        //link.getWorldQuaternion(linkWorldQuat);
		const geometry = new THREE.BoxGeometry( 1,2,1 );
		const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		const cube = new THREE.Mesh( geometry, material );
        cube.position.copy(linkWorldPosition);
        //cube.quaternion.copy(linkWorldQuat);
		cube.visible = false;
		const box = new THREE.BoxHelper( cube );
		scene.add( box );
		scene.add( cube );
    }**/
}
=======
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
<<<<<<< HEAD
let cubeShape, cubeBody;
>>>>>>> 3862ed5 (Started to add physics to the simulation. Not really working right now. Object pickup is broken, in this commit. Objects only fall if you move the camera, this is intentional.)
=======

<<<<<<< HEAD
//const physicsTween = new TWEEN.Tween();



function doNothing(){
    console.log('Nothing done');
}
>>>>>>> 7eccd06 (Work on the physics simulation. Some cleanup. Minor changes on the watchBlocks function in blockly.js)
=======
>>>>>>> 9c6dcb3 (Physics rendering added to simulation.js. Physics are buggy. You can pick something up and drop it. Physical bodies are added to objects at runtime. A proper cleanup and bug hunting needs to be done.)

export function initCannon() {
    //World
    world = new CANNON.World();
<<<<<<< HEAD
    world.gravity.set(0, 0, -9.81);
    world.broadphase = new CANNON.NaiveBroadphase();
    //const solver = new CANNON.GSSolver()
    //world.solver = solver;
    world.solver.tolerance = 0.001
    world.quatNormalizeFast = true;
    world.solver.iterations = 10;
    world.allowSleep = true;

    //Floor
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body({ mass: 0 });
    floorBody.addShape(floorShape);
    floorBody.material = new CANNON.Material({ friction: 4, restitution: -2});
    floorBody.quaternion.setFromEuler(0, 0, -Math.PI / 2);
    floorBody.allowSleep = true;
    floorBody.sleepSpeedLimit = 0.2;
    floorBody.sleepTimeLimit = 0.1;
    world.addBody(floorBody);
    initDone = true;
    console.log('Physics init done');
    debug();
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

export function addBodyToWorld(simObject) {
    world.addBody(simObject.body);
    //debug();
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
    let limit = simObjects.length;
    for (let i = 0; i < limit; i++) {
        simObjects[i].updateMesh();
    }
}

export function updateBodies(simObjects) {
    for (let i = 0; i < simObjects.length; i++) {
        simObjects[i].updateBody();
    }
}

export function isWorldActive() {
    return world.hasActiveBodies;
=======
    world.gravity.set(0, 0, -9);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 8;
    world.allowSleep = true;
    //world.addEventListener('sleepEvent', doNothing);

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
    body.sleepTimeLimit = 0.5;

    //body.addEventListener("sleepy", function(e){
    //    bedTimeManagement(e);
    //});
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
//Removes every body, not used right now.
export function removeAllBodies(simObjects) {
    for (var i = 0; i < simObjects.length; i++) {
        removeBody(simObjects[i]);
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

//much better now.
export function isAsleep() {
    const simObjects = getSimObjects();
    let returnVal = true;
    for (var i = 0; i < simObjects.length; i++) {
        if (simObjects[i].asleep == false) {
            returnVal = false;
            break;
        }
    }
<<<<<<< HEAD
    else if (simObjects == undefined) {
        console.warn('You have broken the law, simObjects in isAsleep() are undefined!');
        //I think it is best then somthing is worng not to render, aka
        //we pretend that every body is asleep
        return true;
    }
>>>>>>> 3862ed5 (Started to add physics to the simulation. Not really working right now. Object pickup is broken, in this commit. Objects only fall if you move the camera, this is intentional.)
=======
    return returnVal;
>>>>>>> 7e4873f (Physics are now working as intended. When adding a 3D object the objects are now place on top of each other.)
}
