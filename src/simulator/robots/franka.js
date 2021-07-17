import Robot from './robotbase'


class Franka extends Robot {
	constructor() {
		super("Franka", "franka_description", "robots/panda_arm_hand.urdf.xacro");

		this.partNames.arm = [
			"panda_joint0",
			"panda_link0",
			"panda_joint1",
			"panda_link1",
			"panda_joint2",
			"panda_link2",
			"panda_joint3",
			"panda_link3",
			"panda_joint4",
			"panda_link4",
			"panda_joint5",
			"panda_link5",
			"panda_joint6",
			"panda_link6",
			"panda_joint7",
			"panda_link7",
			"panda_joint8"
		];
		this.partNames.hand = [
			"panda_hand_joint",
			"panda_hand",
			"panda_finger_joint1",
			"panda_leftfinger",
			"panda_finger_joint2",
			"panda_rightfinger",
		];

		this.modelScale = 10;
		
		this.defaultPose = {
			panda_joint1: 0.5,
			panda_joint2: -0.3,
			panda_joint4: -1.8,
			panda_joint6: 1.5,
			panda_joint7: 1.0,
		};

		this.tcp.parent = "panda_hand";
		this.tcp.position = [0, 0, 0.103394];

		this.ikEnabled = [
			"panda_joint1",
			"panda_joint2",
			// 'panda_joint3',
			"panda_joint4",
			// 'panda_joint5',
			// 'panda_joint6',
			// 'panda_joint7',
		];

		this.interactionJointLimits = {
			panda_joint4: { upper: -Math.PI / 6 },
		};
	}
}

module.exports = new Franka();