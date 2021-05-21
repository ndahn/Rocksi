import * as Blockly from 'blockly';

import ClickableTargetMutator from '../mutators/clickable_target_mutator'
import Simulation from '../../simulator/simulation'

Blockly.Blocks["joint_space_pose"] = {
	init: function () {
		const sim = Simulation.instance;
		this.numJoints = sim.robot.arm.movable.length;
		
		let the_message = '';
		let the_args = [];
		// 1-based
		for (let i = 1; i <= this.numJoints; i++) {
			the_message += 'j' + i + ' %' + i;
			the_args.push({
				type: "field_angle",
				name: "JOINT_" + i,
				angle: 0
			});
		}
		
		this.jsonInit({
			type: "joint_space_pose",
			message0: the_message,
			args0: the_args,
			inputsInline: true,
			output: "JointspacePose",
			style: 'movement_blocks',
			tooltip:
				"Eine Pose im Gelenkwinkelraum (ein Winkel pro Gelenk, d.h. von der Basis zum Endeffektor)",
			helpUrl: "",
		});
		this.setMutator(new ClickableTargetMutator());
	},
	
	onClick: function (e) {
		Simulation.getInstance().then(sim => {
			const pose = sim.getJointSpacePose();
			for (let j = 0; j < pose.length; j++) {
				let deg = pose[j] * 180.0 / Math.PI;
				this.setFieldValue(deg.toFixed(0), 'JOINT_' + (j + 1));
			}
		});
	},
};

Blockly.JavaScript["joint_space_pose"] = function (block) {
	let pose = [];
    for (let i = 1; i < 8; i++) {
        pose.push(block.getFieldValue('JOINT_' + i));
    }

	let code = '[' + pose.toString() + ']';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
