import { Vector3 } from "three"

var FIK = require("@aminere/fullik")
// FIK uses its own namespace which is kindof dumb...
Object.assign(window, { FIK });


class FABRIK {
	constructor(scene, robot) {
		this._ikchain = new FIK.Chain3D(0xbb0077);
		this._ikchain.setFixedBaseMode(true);
		this.skeleton = robot.createSkeleton();

		// Skeleton visualization
		/*
		let points = [];
		let tmp = new Vector3();
		let off = 0.0;
		for (let b of this.skeleton) {
			b.getWorldPosition(tmp);
			off += 0.5;
			tmp.y += off;
			points.push(tmp.clone());
		}
		showPoints(scene, points);
		*/
        /* 
		let root = this.skeleton[0];
		root.position.y = 2;
        let helper = new SkeletonHelper(root);
        scene.add(helper);
        scene.add(root);
		*/

		let pos = new Vector3();
		let nextPos = new Vector3();
		let difference = new Vector3();

		// Base bone the others can attach to
		this.skeleton.origin.getWorldPosition(pos);
		this.skeleton.bones[0].getWorldPosition(nextPos);
		this._ikchain.addBone(new FIK.Bone3D(new FIK.V3(pos.x, pos.y, pos.z), 
											 new FIK.V3(nextPos.x, nextPos.y, nextPos.z))
						 	 );
		
		for (let i = 0; i < this.skeleton.bones.length; i++) {
			let bone = this.skeleton.bones[i];
			let next = this.skeleton.bones[i + 1] || this.skeleton.tip;
			let joint = bone.robotJoint;

			bone.getWorldPosition(pos);
			next.getWorldPosition(nextPos)
			difference.addVectors(pos, nextPos.clone().negate());

			let distance = difference.length();
			let direction = new FIK.V3(difference.x, difference.y, difference.z);
			let jointAxis = new FIK.V3(joint.axis.x, joint.axis.y, joint.axis.z);
			
			// TODO
			// let angleReferenceVector = ???;
			// chain.addConsecutiveHingedBone(direction, distance, 'local', jointAxis, joint.limit.lower, joint.limit.upper, jointReference);

			this._ikchain.addConsecutiveFreelyRotatingHingedBone(direction, distance, 'local', jointAxis);
		}
	}

	solve(target, robot, ikjoints, {
        apply = false,
    } = {}) {
		this._ikchain.solveForTarget(target);
		let solution = {};
		
		let locked = [];
		let limits = null;

		// Lock the robot's joints that are not appearing in ikjoints in place
		if (ikjoints.length && ikjoints.length < this.skeleton.bones.length) {
			for (let bone of this.skeleton.bones) {
				if (!ikjoints.includes(bone.robotJoint)) {
					locked.push(bone);
				}
			}
			limits = this.lockJoints(locked);
		}

		for (let i = 0; i < this._ikchain.bones.length - 1; i++) {
			let ikBone = this._ikchain.bones[i];
			let angle = ikBone.joint.rotor;
			
			let joint = this.skeleton.bones[i].robotJoint;
			solution[joint.name] = angle;
			
			if (apply) {
				joint.setJointValue(angle);
			}
		}

		this.unlockJoints(locked, limits);
		return solution;
	}

	lockJoints(bones) {
		let limits = {};

		for (let bone of bones) {
			let joint = bone.robotJoint;

			limits[bone] = {
				min: joint.min,
				max: joint.max,
				freeHinge: joint.freeHinge
			};

			joint.min = joint.max = joint.rotor;
			joint.freeHinge = false;
		}

		return limits;
	}

	unlockJoints(bones, limits) {
		for (let bone of bones) {
			let joint = bone.robotJoint;
			let limit = limits[bone];

			joint.min = limit.min;
			joint.max = limit.max;
			joint.freeHinge = limit.freeHinge;
		}
	}
};

export default FABRIK;
