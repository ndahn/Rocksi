import * as Blockly from 'blockly';

import ClickableTargetMutator from '../mutators/clickable_target_mutator'
import Simulation from '../../simulator/simulation'

Blockly.Blocks["joint_space_pose"] = {
	init: function () {
		this.jsonInit({
			type: "joint_space_pose",
			message0: "j1 %1 j2 %2 j3 %3 j4 %4 j5 %5 j6 %6 j7 %7",
			args0: [
				{
					type: "field_angle",
					name: "JOINT_1",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "JOINT_2",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "JOINT_3",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "JOINT_4",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "JOINT_5",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "JOINT_6",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "JOINT_7",
					angle: 0,
				},
			],
			inputsInline: true,
			output: "Array",
			colour: "#4c97ff",
			tooltip:
				"Eine Pose im Gelenkwinkelraum (ein Winkel pro Gelenk, von der Basis zum Endeffektor)",
			helpUrl: "",
		});
		this.setMutator(new ClickableTargetMutator());
	},
	onClick: function (e) {
		Simulation.getInstance(sim => {
			const pose = sim.getJointSpacePose();
			for (let j = 0; j < pose.length; j++) {
				let deg = pose[j] * 180.0 / Math.PI;
				this.setFieldValue(deg.toFixed(0), 'JOINT_' + (j + 1));
			}
		});
	},
};

Blockly.JavaScript["joint_space_pose"] = function (block) {
    let ret = '["joint_space", ';
    for (let i = 1; i < 8; i++) {
        ret += block.getFieldValue('JOINT_' + i) + ', ';
    }
	ret = ret.slice(0, -1) + ']';

    return [ret, Blockly.JavaScript.ORDER_ATOMIC];
};
