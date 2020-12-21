import * as Blockly from 'blockly';
import Simulation from '../../simulator/simulation'

Blockly.Blocks["default_pose"] = {
	init: function () {
		this.jsonInit({
			type: "default_pose",
			message0: "Startpose",
			output: "Array",
			colour: "%{BKY_MOVEMENT_HEX}",
			tooltip:
				"Die Standard-Pose des Roboters",
			helpUrl: "",
		});

		Simulation.getInstance(sim => {
			const pose = [];
			const defaults = sim.robot.defaultPose;

			for (const joint of sim.robot.jointsOrdered) {
				if (joint._jointType !== 'fixed' && sim.robot.isArm(joint)) {
					let angle = defaults[joint.name] || 0.0
					angle *= 180 / Math.PI;
					pose.push(angle);
				}
			}
			
			let tooltip = '';
			for (let i = 0; i < pose.length; i++) {
				tooltip += 'j' + (i + 1) + ': ' + pose[i].toFixed(0) + '°\n';
			}
			this.setTooltip(tooltip);

			this.defaultPose = pose;
		});
	},
	defaultPose: new Array(7).fill(0)
};

Blockly.JavaScript["default_pose"] = function (block) {
    let ret = '["joint_space", ' + this.defaultPose.toString() + ']';
    return [ret, Blockly.JavaScript.ORDER_ATOMIC];
};
