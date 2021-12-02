import Robot from './robotbase'


class Sawyer extends Robot {
	constructor() {
		super("Sawyer", "sawyer_description", "urdf/sawyer_rocksi.urdf.xacro");

		this.partNames.arm = [
			"base",
			"torso",
			"right_arm_mount",
			"torso_t0",
			"right_arm_base_link",
			"right_l0",
			"right_j0",
			// "head",
			// "head_pan",
			// "right_torso_itb_l",
			// "right_torso_itb_j",
			"right_l1",
			"right_j1",
			"right_l2",
			"right_j2",
			"right_l3",
			"right_j3",
			"right_l4",
			"right_j4",
			// "right_arm_itb_l",
			// "right_arm_itb_j",
			"right_l5",
			"right_j5",
			// "right_hand_camera_l",
			// "right_hand_camera_j",
			// "right_wrist_l",
			// "right_wrist_j",
			"right_l6",
			"right_j6",
			// "right_hand_l",
			// "right_hand_j",
			// "right_l1_2",
			// "right_j1_2",
			// "right_l2_2",
			// "right_j2_2",
			// "right_l4_2",
			// "right_j4_2",
			// "screen",
			// "display_joint",
			// "head_camera_l",
			// "head_camera_j"
		];
		this.partNames.hand = [
			"right_hand_l",
			"right_hand_j",
		];

		this.modelScale = 10;
		
		this.defaultPose = {
			right_j0: 1.2408,
			right_j1: -1.024,
			right_j2: -1.3984,
			right_j3: 0.7367,
			right_j4: 0.2976,
			right_j5: 1.5476,
			right_j6: -1.193
		};

		this.tcp.parent = "right_hand_l";
		this.tcp.position = [0, 0, 0.05];

		this.ikEnabled = [
			"right_j0",
			"right_j1",
			"right_j2",
			"right_j3",
			//"right_j4",
			"right_j5",
			//"right_j6",
		];

		this.interactionJointLimits = {
			//panda_joint4: { upper: -Math.PI / 6 },
		};
	}
}

module.exports = new Sawyer();