import { Bone, Skeleton, SkeletonHelper, Vector3 } from "three"
import { IK, IKChain, IKJoint, IKHingeConstraint, IKHelper } from "three-ik";

import { toDeg, transferPosition, showPoints } from './utils.js'

function setupIK(scene, robot, controlTarget) {
	const ik = new IK();
    const ikchain = new IKChain();
    const bones = [];

	let boneParent;
	const positions = [];

	robot.traverse(child => {
		console.log(child)

		switch (child.type) {
			case "URDFJoint":
				break;
			
			case "URDFLink":
				let p = new Vector3();
				child.getWorldPosition(p);
				p.z += 2.0;
				positions.push(p);  // TODO only for visualization

				let bone = new Bone();
				bone.name = 'bone_' + child.name;
				bone.matrixWorld.copy(child.matrixWorld);
				boneParent && boneParent.add(bone);
				boneParent = bone;
				bones.push(bone);

				let jointTarget = (child.name === 'panda_hand_joint') ? controlTarget : null;

				let joint_name = child.name.replace('link', 'joint');
				const joint = robot.joints[joint_name];
				let constraint;
				if (joint) {
					constraint = [
						new IKHingeConstraint(toDeg(joint.limit.lower), toDeg(joint.limit.upper)),
					];
				}
				ikchain.add(new IKJoint(bone, constraint ? { constraint } : {}, { jointTarget }));

				break;
			
			default:
				console.log('Skipping child ' + child.name + ' of type ' + child.type);
				break;
		}
	});

	showPoints(scene, positions);

	let skeleton = new Skeleton(bones);
	const skeletonHelper = new SkeletonHelper(bones[0]);
	skeletonHelper.visible = true;
	scene.add(skeletonHelper);

	ik.add(ikchain);
	let ikhelper = new IKHelper(ik);
	scene.add(ikhelper);
}


export { setupIK }