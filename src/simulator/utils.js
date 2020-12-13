import { PointsMaterial, Geometry, Points, Vector3 } from "three";

function toDeg(rad) {
	return rad * (180 / Math.PI);
}

function transferPosition(source, target) {
    let p = new Vector3();
    source.getWorldPosition(p);
    if (target.parent) {
        p = target.parent.worldToLocal(p);
    }
    target.position.copy(p);
}

function getPositionRelative(object, target) {
    let rel = target || new Vector3();
    object.getWorldPosition(rel);
    if (object.parent) {
        rel = object.parent.worldToLocal(rel);
    }
    return rel;
}

function getRotationRelative(object, target) {
    let rel = target || new Quaternion();
    object.getWorldQuaternion(rel);
    if (object.parent) {
        let pq = new Quaternion();
        object.parent.getWorldQuaternion(pq);
        rel = rel * pq.inverse();
    }
    return rel;
}

function showPoints(scene, positions, material) {
	material =
		material ||
		new PointsMaterial({
			size: 10,
			color: 0x00ff00,
			sizeAttenuation: false,
			depthTest: false,
            depthWrite: true,
            renderOrder: 999
		});
	let geom = new Geometry();

	for (let p of positions) {
		geom.vertices.push(p);
	}

    var dots = new Points(geom, material);
    dots.layers.toggle(31)
	scene.add(dots);
}

export { toDeg, transferPosition, showPoints }