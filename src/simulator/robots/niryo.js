import Robot from './robotbase'
import NiryoGenerator from '../../editor/generators/niryo_v3'


class Niryo extends Robot {
	constructor() {
		super("Niryo", "niryo_robot_description", "urdf/ned/niryo_ned_gripper.urdf.xacro");

		this.robotRoot = "base_link";
		this.handRoot = "tool_link";

		this.modelScale = 20;

		this.defaultPose = {
			joint_1: 0,
			joint_2: 0.32,
			joint_3: -0.68,
			joint_4: 0,
			joint_5: -0.73,
			joint_6: -0.01
		};

		this.tcp.parent = 'hand_link';
		this.tcp.position = [0, 0, 0.08];
		
		this.ikEnabled = [
			"joint_1",
			"joint_2",
			"joint_3",
			// "joint_4",
			"joint_5",
			// "joint_6",
		];

		this.generator = NiryoGenerator;
	}
}


module.exports = new Niryo();
