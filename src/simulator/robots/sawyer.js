import Robot, { getPackage } from './robotbase'


class Sawyer extends Robot {
	constructor() {
		super("Sawyer", "sawyer_description", "urdf/sawyer_rocksi.urdf.xacro");

		// 2 finger and 3 finger grippers. Edit the URDF to decide which one to load!
		this.packages.robotiq_2f_85_gripper_visualization = getPackage('robotiq_2f_85_gripper_visualization');
		this.packages.robotiq_3f_gripper_visualization = getPackage('robotiq_3f_gripper_visualization');

		this.robotRoot = "base";
		this.handRoot = "right_hand_l";
		
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

		this.ikEnabled = [
			"right_j0",
			//"head_pan",
			"right_j1",
			"right_j2",
			"right_j3",
			"right_j4",
			//"right_j5",
			//"right_j6",
		];

		this.interactionJointLimits = {
			//panda_joint4: { upper: -Math.PI / 6 },
		};
	}

	init(model) {
		if ("robotiq_arg2f_base_link" in model.frames) {
			// 2 finger gripper
			this.tcp.position = [0, 0, 0.15];
			this.hand.invertOpenClose = true;
		}
		else {
			// 3 finger gripper
			this.tcp.position = [0.05, 0, 0];
		}
		
		return super.init(model);
	}
}

module.exports = new Sawyer();