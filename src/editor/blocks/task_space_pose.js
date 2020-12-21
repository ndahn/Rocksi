import * as Blockly from "blockly";

import ClickableTargetMutator from '../mutators/clickable_target_mutator'
import Simulation from '../../simulator/simulation'

const fieldKeys = ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW'];

Blockly.Blocks["task_space_pose"] = {
	init: function () {
		this.jsonInit({
			type: "task_space_pose",
			message0: "x %1 y %2 z %3 r %4 p %5 y %6",
			args0: [
				{
					"type": "field_number",
					"name": "X",
					"value": 0,
					"min": 0.0,
					"max": 1.0,
					"precision": 0.1
				},
				{
					"type": "field_number",
					"name": "Y",
					"value": 0,
					"min": 0.0,
					"max": 1.0,
					"precision": 0.1
				},
				{
					"type": "field_number",
					"name": "Z",
					"value": 0,
					"min": 0.0,
					"max": 1.0,
					"precision": 0.1
				},
				{
					type: "field_angle",
					name: "ROLL",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "PITCH",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "YAW",
					angle: 0,
				},
			],
			inputsInline: true,
			output: "Array",
			colour: "%{BKY_MOVEMENT_HEX}",
			tooltip:
				"Eine Pose im Arbeitsraum (definiert über die Endeffektorpose, Position und Orientierung)",
			helpUrl: "",
		});
		this.setMutator(new ClickableTargetMutator());
	},
	onClick: function (e) {
		Simulation.getInstance(sim => {
			const pose = sim.getTaskSpacePose();
			for (let j = 0; j < 3; j++) {
				this.setFieldValue(pose[j].toFixed(1), fieldKeys[j]);
			}
			for (let j = 3; j < 6; j++) {
				let deg = pose[j] * 180.0 / Math.PI;
				this.setFieldValue(deg.toFixed(0), fieldKeys[j]);
			}
		});
	},
};


Blockly.JavaScript["task_space_pose"] = function (block) {
    let ret = '["task_space", ';
    for (const key of fieldKeys) {
        ret += block.getFieldValue(key) + ', ';
    }
    ret = ret.slice(0, -1) + ']'

    return [ret, Blockly.JavaScript.ORDER_ATOMIC];
};
