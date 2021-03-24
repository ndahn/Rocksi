import * as THREE from 'three';
import addMeshToScene from '../scene';

function create3dObject(){
    //for testing
    const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1, 10, 10);
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubeMesh.castShadow = true;
    cubeMesh.position.x  = 10;
    cubeMesh.position.y  = 10;
    cubeMesh.position.z  = 0.5;
    cubeMesh.name = "Ineedanidentyfier"
    const meshname = addMeshToScene(cubeMesh);
    console.log(meshname);
}



export default create3dObject;
