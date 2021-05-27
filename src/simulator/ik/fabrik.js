import { Vector3, SkeletonHelper } from "three"

var FIK = require("@aminere/fullik")
// FIK uses its own namespace which is kindof dumb...
Object.assign(window, { FIK });


class FABRIK {
	constructor(scene, robot) {
		this._ikchain = new FIK.Chain3D(0xbb0077);
		this._ikchain.setFixedBaseMode(true);
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
	}

	solve(target, robot, ikjoints, {
        apply = false,
    } = {}) {
		this._ikchain.solveForTarget(target);
		let solution = {};
		
		let locked = [];
		let limits = null;

		// Lock the robot's joints that are not appearing in ikjoints in place
		if (ikjoints.length && ikjoints.length < this.skeleton) {
			for (let bone of this.skeleton) {
				if (!ikjoints.includes(bone.robotJoint)) {
					locked.push(bone);
				}
			}
			limits = this.lockJoints(locked);
		}

		for (let i = 0; i < this._ikchain.bones.length; i++) {
			let ikBone = this._ikchain.bones[i];
			let angle = ikBone.rotor;
			
			let joint = this.skeleton[i];
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
			let joint = bone.joint;

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
		for (let bone in bones) {
			let joint = bone.joint;
			let limit = limits[bone];

			joint.min = limit.min;
			joint.max = limit.max;
			joint.freeHinge = limit.freeHinge;
		}
	}
};

export default FABRIK;
