//cannon-es import
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
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

export function initCannon() {
    //World
    world = new CANNON.World();
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
//Removes every body, not used right now.
export function removeAllBodies(simObjects) {
    for (var i = 0; i < simObjects.length; i++) {
        removeBody(simObjects[i]);
    }
}

export function updateBodies(simObjects) {
    for (let i = 0; i < simObjects.length; i++) {
        simObjects[i].updateBody();
    }
}

export function isWorldActive() {
    return world.hasActiveBodies;
}
