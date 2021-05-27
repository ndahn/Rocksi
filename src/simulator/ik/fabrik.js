import { Vector3, SkeletonHelper } from "three"

var FIK = require("@aminere/fullik")
// FIK uses its own namespace which is kindof dumb...
Object.assign(window, { FIK });


class FABRIK {
	constructor(scene, robot) {
		this._solver = new FIK.Structure3D();
		this._solver.setFixedBaseMode(true);
		this._ikchain = new FIK.Chain3D(0xbb0077);
		this.skeleton = this.createSkeleton(robot);

		// Skeleton visualization
        /* 
		let root = this.skeleton[0];
		root.position.y = 2;
        let helper = new SkeletonHelper(root);
        scene.add(helper);
        scene.add(root);
		*/
		
		// Base bone
		let bonePos = new Vector3();
		let nextPos = new Vector3();
		let difference = new Vector3();
		
		for (let i = 1; i < this.skeleton.length - 1; i++) {
			let bone = this.skeleton[i];
			let next = this.skeleton[i+1];
			let joint = bone.robotJoint;

			bone.getWorldPosition(bonePos);
			next.getWorldPosition(nextPos);
			difference.addVectors(bonePos, nextPos.negate());

			let distance = difference.length();
			let direction = FIK.V3(...difference);
			let jointAxis = FIK.V3(...joint.axis);
			
			// TODO
			// let angleReferenceVector = ???;
			// chain.addConsecutiveHingedBone(direction, distance, 'local', jointAxis, joint.limit.lower, joint.limit.upper, jointReference);

			this._ikchain.addConsecutiveFreelyRotatingHingedBone(direction, distance, 'local', jointAxis);
		}

		this._solver.add(this._ikchain, robot.tcp.object);
	}

	solve(target, tip, joints, {
        apply = false,
    } = {}) {
		this._solver.update();
		let solution = {};

		for (let i = 0; i < this._ikchain.bones.length; i++) {
			let ikBone = this._ikchain.bones[i];
			let angle = ikBone.rotor;
			
			let joint = this.skeleton[i];
			solution[joint.name] = angle;
			
			if (apply) {
				joint.setJointValue(angle);
			}
		}

		return solution;
	}
};

export default FABRIK;
