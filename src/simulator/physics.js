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

import { getSimObjects } from './objects/objects';
import { getMesh, addMesh } from './scene';
//Physics setup

//variables for the physics simulation
const dt = 0.02
let world;
let bodies = [];
let cubeShape, cubeBody;
>>>>>>> 4c6ae0d (Started to add physics to the simulation. Not really working right now. Object pickup is broken, in this commit. Objects only fall if you move the camera, this is intentional.)

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
>>>>>>> 4c6ae0d (Started to add physics to the simulation. Not really working right now. Object pickup is broken, in this commit. Objects only fall if you move the camera, this is intentional.)
}
