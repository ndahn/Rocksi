import Robot from './robotbase'


class Franka extends Robot {
	constructor() {
		super("Franka", "franka_description", "robots/panda_arm_hand.urdf.xacro");

		this.robotRoot = "panda_link0";
		this.handRoot = "panda_hand";

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