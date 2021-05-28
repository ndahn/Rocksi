import * as THREE from 'three'
import { Vector3, Mesh, CylinderGeometry, MeshStandardMaterial, Matrix4, AxesHelper, ArrowHelper } from "three"
import { showPoints } from '../utils'

var FIK = require("fullik")
// FIK uses its own namespace which is kindof dumb...
Object.assign(window, { FIK });
Object.assign(window, {THREE})


class FABRIK {
	constructor(scene, robot) {
		this._ikchain = new FIK.Chain3D(0xbb0077);
		this._ikchain.setFixedBaseMode(true);
		this.skeleton = robot.createSkeleton();

		let pos = new Vector3();
		let nextPos = new Vector3();
		let difference = new Vector3();

		// Base bone the other bones can attach to
		this.skeleton.origin.getWorldPosition(pos);
		this.skeleton.bones[0].getWorldPosition(nextPos);
		difference.addVectors(nextPos, pos.clone().negate());

		let basebone = new FIK.Bone3D(new FIK.V3(pos.x, pos.y, pos.z), new FIK.V3(nextPos.x, nextPos.y, nextPos.z))
		this._ikchain.addBone(basebone);

		// Make sure the base bone does not move and provides a constant reference
		let baseAxis = new FIK.V3(difference.x, difference.y, difference.z);
		this._ikchain.setRotorBaseboneConstraint('global', baseAxis, 0);
		
		// Create the IK chain
		for (let i = 0; i < this.skeleton.bones.length; i++) {
		//for (let i = 1; i < 2; i++) {
			let bone = this.skeleton.bones[i];
			let next = this.skeleton.bones[i + 1] || this.skeleton.tip;
			let joint = bone.robotJoint;

			bone.getWorldPosition(pos);
			next.getWorldPosition(nextPos)
			difference.addVectors(nextPos, pos.clone().negate());

			let distance = difference.length();
			let direction = new FIK.V3(difference.x, difference.y, difference.z);
			let jointAxis = new FIK.V3(joint.axis.x, joint.axis.y, joint.axis.z);
			
			//joint.add(new AxesHelper(0.3));
			//joint.add(new ArrowHelper(joint.axis, new Vector3(), 0.35, 0xff00aa));
			//scene.add(new ArrowHelper(direction, pos, 5, 0xff0000))

			// TODO
			// The hinges are local to the links and rotate with them
			// let angleReferenceVector = ???;
			// chain.addConsecutiveHingedBone(direction, distance, 'local', jointAxis, joint.limit.lower, joint.limit.upper, jointReference);

			this._ikchain.addConsecutiveFreelyRotatingHingedBone(direction, distance, 'local', jointAxis);
		}

		// TODO remove
		this.createVisualization(scene, robot);
	}

	solve(target, robot, ikjoints, {
        		apply = false,
    		} = {}) {
		//this._ikchain.solveForTarget(target.getWorldPosition());
		this.structure.targets[0] = target.getWorldPosition();
		this.structure.update();
		let solution = {};
		
		let locked = [];
		let limits = null;

		// Lock the robot's joints that are not appearing in ikjoints in place
		if (ikjoints.length && ikjoints.length < this.skeleton.bones.length) {
			for (let bone of this.skeleton.bones) {
				if (!ikjoints.includes(bone.robotJoint)) {
					// TODO reenable
					//locked.push(bone);
				}
			}
			limits = this.lockJoints(locked);
		}

		// Skip the base bone
		for (let i = 1; i < this._ikchain.bones.length; i++) {
			let parent = this._ikchain.bones[i-1];
			let ikbone = this._ikchain.bones[i];
			let angle = FIK._Math.findAngle(parent, ikbone);
			
			let joint = this.skeleton.bones[i-1].robotJoint;
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

			// TODO 
			let angle = ikbone.getDirectionUV().angleTo(parent.getDirectionUV());
			joint.min = joint.max = angle;
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


	createVisualization(scene, robot) {
		this.structure = new FIK.Structure3D(scene);
		this.structure.add(this._ikchain, robot.tcp.object.getWorldPosition(), true);
		this.structure.update();

		let points = [];
		for (let ikbone of this._ikchain.bones) {
			let ikjoint = ikbone.joint;

			let p1 = new Vector3(ikbone.start.x, ikbone.start.y, ikbone.start.z)
			let p2 = new Vector3(ikbone.end.x, ikbone.end.y, ikbone.end.z);
			let r = new Vector3(ikjoint.rotationAxisUV.x, ikjoint.rotationAxisUV.y, ikjoint.rotationAxisUV.z);
			p2.add(p1.clone().negate());
			
			scene.add(new ArrowHelper(p2, p1, 6, 0xffff00));  // good
			scene.add(new ArrowHelper(r, p1, 3, 0x00ffff));  // 90° off

			points.push(p1);
		}
		showPoints(scene, points, 0x000000);

		/* 
        let helper = new SkeletonHelper(this.skeleton.root);
        scene.add(helper);
        scene.add(root);
		*/
	}
};

export default FABRIK;
