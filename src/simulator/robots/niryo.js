import Robot from './robotbase'
import NiryoGenerator from '../../editor/generators/niryo_v3'


class Niryo extends Robot {
	constructor() {
		super("Niryo", "niryo_robot_description", "urdf/ned/niryo_ned_gripper.urdf.xacro");

		this.partNames.arm = [
			"joint_1",
			"shoulder_link",
			"joint_2",
			"arm_link",
			"joint_3",
			"elbow_link",
			"joint_4",
			"forearm_link",
			"joint_5",
			"wrist_link",
			"joint_6",
			"hand_link",
			"hand_tool_joint",
			"tool_link"
		];
		this.partNames.hand = [
			"joint_to_gripper",
			"base_gripper_1",
			"joint_base_to_mors_1",
			"mors_1",
			"joint_base_to_mors_2",
			"mors_2"
		];

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
