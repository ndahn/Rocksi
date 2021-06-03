import {
    Vector3,
    Mesh,
    MeshPhongMaterial,
} from 'three'

import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry";

export function makeRock(vertices, diameter, color) {
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
    let mat = new MeshPhongMaterial({
        color: color,
        roughness: 1,
        flatShading: true
    });

    return new Mesh(hull, mat);
}


export default makeRock;
