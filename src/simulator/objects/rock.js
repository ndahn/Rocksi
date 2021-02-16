import {
    Vector3,
    Mesh,
    MeshStandardMaterial,
} from 'three'

import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry";


const COLORS = [0x22223b, 0x4a4e69, 0x9a8c98, 0xc9ada7, 0xf2e9e4, 0xe0afa0, 0xb8b08d, 0xf2d492, 0x432818, 0x6f1d1b, 0xffe6a7, 0x723d46, 0x065a82]


function makeRock(vertices, diameter, color = null) {
    let points = [];
    for (let i = 0; i < vertices; i++) {
        points.push(
            new Vector3(
                Math.random() * diameter,
                Math.random() * diameter,
                Math.random() * diameter
            )
        );
    }

    let hull = new ConvexGeometry(points);
    let mat = new MeshStandardMaterial({
        color: color || COLORS[Math.random() * COLORS.length | 0],
        roughness: 1, 
        flatShading: true
    });

    return new Mesh(hull, mat);
}


export default makeRock;
