import * as THREE from 'three';
import {addMesh,
        remMesh,
        getMesh,
        moveMesh} from '../scene';

//I dont know how to avoid this simObjects array right now.
//Maybe I ask the scene for the mesh names instead
//this can not be an arry, it has to be a set...
let simObjects = [];

export class simObject {
    constructor(x, y, z, rotZ, name, type) {
        this.x = 5;
        this.y = 5;
        this.z = 0.5;
        this.rotZ = 0;
        this.name = 'default';
        this.type = 'cube';
    }
}

function createMesh(simObject){

    function randomColor() {
        const hexDigits = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += hexDigits[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    if(simObject.type === 'cube'){
        const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1, 10, 10);
        const cubeMaterial = new THREE.MeshPhongMaterial({ color: randomColor() });
        const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cubeMesh.castShadow = true;
        cubeMesh.position.x  = simObject.x;
        cubeMesh.position.y  = simObject.y;
        cubeMesh.position.z  = simObject.z;
        cubeMesh.name = simObject.name;
        addMesh(cubeMesh);
    }

    if(simObject.type === 'cylinder'){
        const cylinderGeometry = new THREE.CylinderBufferGeometry(1, 1, 1, 10, 10);
        const cylinderMaterial = new THREE.MeshPhongMaterial({ color: randomColor() });
        const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinderMesh.castShadow = true;
        cylinderMesh.position.x  = getRandomInt(10);
        cylinderMesh.position.y  = getRandomInt(10);
        cylinderMesh.position.z  = 0.5;
        cylinderMesh.name = simObject.name;
        addMesh(cylinderMesh);
    }
}

//getting the index of an specific simObject... I really should use sets...
function getSimObjectIdx(simObjectsArray, simObject){
    for (let i = 0; i < simObjects.length; i++) {
        if (simObjects[i].name == simObject.name) return i;
    }
}

export function changeSimObject(simObject){
    let idx = getSimObjectIdx(simObjects, simObject);
    simObjects[idx] = simObject;
    remMesh(simObjects[idx]);
    createMesh(simObjects[idx]);
}

//Random integers. They are essential.
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

export function addSimObjects(idList){
    console.log('idList',idList);
    for(let i = 0; i < idList.length; i++){
        if(simObjects.find(object => object.name === idList[i]) === undefined){
            let newSimObject = new simObject;
            newSimObject.name = idList[i];
            simObjects.push(newSimObject);
            createMesh(newSimObject);
        }
    }
}

export function remSimObjects(idList){
    //I have to decide on a method for doing this kind of array operation...
    for(let i = 0; i < idList.length; i++){
        for(let k = 0; k < simObjects.length; k++){
            if(simObjects[k].name == idList[i]){
                remMesh(simObjects[k]);
                simObjects.splice(k, 1);
            }
        }
    }
}

export function getSimObjectsIds(){
    let simObjectsIds = [];
    simObjects.forEach(simObject => simObjectsIds.push(simObject.name));

    return simObjectsIds
}

export function getSimObject(simObject){
        let object =  [...simObjects].filter(name => simObjects.includes(name));
        console.log('getSimObject return val:', object)
        return object[0]
}
