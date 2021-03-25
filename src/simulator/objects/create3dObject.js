import * as THREE from 'three';
import addMeshToScene from '../scene';

let simObjects = [];

function create3dObject(x = 3, y = 3, z = 0.5){
    //for testing
    const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1, 10, 10);
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubeMesh.castShadow = true;
    cubeMesh.position.x  = x;
    cubeMesh.position.y  = y;
    cubeMesh.position.z  = z;
    cubeMesh.name = "Ineedanidentyfier"
    const meshname = addMeshToScene(cubeMesh);
    console.log(meshname);
}

export function update3dObjects(idList){
    simObjects = idList;
}

export function get3dObjects(){
    return simObjects;
}
