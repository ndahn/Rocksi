import * as Blockly from 'blockly';
import Simulation from '../../simulator/simulation'

Blockly.Blocks["default_pose"] = {
	init: function () {
		this.jsonInit({
			type: "default_pose",
			message0: "Startpose",
			output: "JointspacePose",
			style: 'movement_blocks',
			tooltip:
				"Die Standard-Pose des Roboters",
			helpUrl: "",
		});

		const sim = Simulation.instance;
		const pose = [];
		const robot = sim.robot;
		const defaults = robot.defaultPose;

		for (const joint of robot.arm.movable) {
			let angle = defaults[joint.name] || 0.0
			angle *= 180 / Math.PI;
			pose.push(angle);
		}
		
		let tooltip = '';
		for (let i = 0; i < pose.length; i++) {
			tooltip += 'j' + (i + 1) + ': ' + pose[i].toFixed(0) + '°\n';
		}
		this.setTooltip(tooltip);

		this.defaultPose = pose;
	},
};

Blockly.JavaScript["default_pose"] = function (block) {
	let ret = '[' + this.defaultPose.toString() + ']';
    return [ret, Blockly.JavaScript.ORDER_ATOMIC];
};
