import { Bone, Skeleton, SkeletonHelper, Vector3, Matrix4, ArrowHelper } from "three"
import { IK, IKChain, IKJoint, IKHingeConstraint, IKHelper } from "three-ik";

import { toDeg, showPoints } from './utils.js'

function setupIK(scene, robot, controlTarget) {
	const ik = new IK();
    const ikchain = new IKChain();
    const bones = [];

	let boneParent;
	const positions = [];

	robot.traverse(child => {
		//console.log(child)

		switch (child.type) {
			case "URDFJoint":
				break;
			
			case "URDFLink":
				let p = new Vector3();
				child.getWorldPosition(p);
				p.z += 2;
				positions.push(p);  // TODO only for visualization

				let bone = new Bone();
				bone.name = 'bone_' + child.name;
				bone.matrixWorld.copy(child.matrixWorld);
				if (boneParent) {
					bone.scale.copy(child.scale);
					bone.position.copy(p);
					bone.rotation.copy(child.rotation);
					bone.updateMatrix();
					
					boneParent.add(bone);
					let inv = new Matrix4().getInverse(boneParent.matrixWorld);
					//bone.applyMatrix4(inv);

					console.log(bone.position);
					console.log(boneParent.position);
					console.log(bone.position);
					console.log(boneParent.position);
				};
				boneParent = bone;
				bones.push(bone);
				
				/*
				child.isBone = true;
				let bone = child;
				bones.push(bone);
				*/

				let jointTarget = (child.name === 'panda_hand') ? controlTarget : null;

				let joint_name = child.name.replace('link', 'joint');
				const joint = robot.joints[joint_name];
				let constraint;
				if (joint) {
					constraint = [
						new IKHingeConstraint(toDeg(joint.limit.lower), toDeg(joint.limit.upper)),
					];

					console.log(joint);
					const arrow = new ArrowHelper(joint.axis || joint.up, p, 1.0, 0xff00ff);
					scene.add(arrow);
				}
				ikchain.add(new IKJoint(bone, constraint ? { constraint } : {}, { jointTarget }));

				break;
			
			default:
				//console.log('Skipping child ' + child.name + ' of type ' + child.type);
				break;
		}
	});

	showPoints(scene, positions);

	
	let skeleton = new Skeleton(bones);
	const skeletonHelper = new SkeletonHelper(bones[0]);
	skeletonHelper.visible = true;
	scene.add(skeletonHelper);

	for (let j of ikchain.joints) {
		let p = j.bone.position.clone();
		p.x += 2;
		const arrow2 = new ArrowHelper(j._getDirection(), p, 3.0, 0x00ffff);
		scene.add(arrow2);
	}
	

	ik.add(ikchain);
	//let ikhelper = new IKHelper(ik);
	//scene.add(ikhelper);

	return ik;
}


export { setupIK }