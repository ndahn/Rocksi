import { Vector3, Quaternion, Euler, Matrix4, AxesHelper, ArrowHelper } from "three"
import { toDeg, showPoints } from '../utils.js'

var FIK = require("@aminere/fullik")
// FIK uses its own namespace which is kindof dumb...
Object.assign(window, { FIK });


class FABRIK {
	constructor(scene, robot) {
		this._solver = new FIK.Structure3D();
		this._solver.setFixedBaseMode(true);

		let chain = new FIK.Chain3D(0xbb0077);
		const revolute = [];
		const fixed = [];
		const other = [];

		for (let i = 0; i < robot.jointsOrdered.length; i++) {
			const joint = robot.jointsOrdered[i];
			let link = robot.getLinkForJoint(joint);

			let p = new Vector3();
			p = joint.getWorldPosition(p);
			p.z += 1 + i/10;
			
			if (joint.axis) {
				let q = new Quaternion().setFromAxisAngle(joint.axis, 0);
				q.multiplyQuaternions(joint.origQuaternion || joint.quaternion, q);
				let e = new Euler().setFromQuaternion(q);
				let axis = e.toVector3();
				//axis.applyMatrix4(robot.loadedModel.matrixWorld);
				let arrow = new ArrowHelper(axis, p);
				scene.add(arrow);
			}
			
			switch (joint._jointType) {
				case 'revolute':
					revolute.push(p);
					break;
				
				case 'fixed':
					fixed.push(p);
					break;
				
				default:
					console.log(joint._jointType)
					other.push(p);
					break;
			}
		}

		showPoints(scene, revolute);
		showPoints(scene, fixed, 0xff0000);
		showPoints(scene, other, 0x0000ff);
	}

	solve = undefined;
};

export default FABRIK;
