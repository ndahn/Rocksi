import * as THREE from 'three';
import {scene} from '../scene';

function create3dObject(shape, position){
    console.log("create3dObject triggered");
    console.log(shape, "at position", position);
    //for testing
    const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1, 10, 10)
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 })
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)
    cubeMesh.castShadow = true
    cubeMesh.position.x  = position[0]
    cubeMesh.position.y  = position[1]
    cubeMesh.position.z  = position[2]
    scene.add(cubeMesh)
}

export default create3dObject;
