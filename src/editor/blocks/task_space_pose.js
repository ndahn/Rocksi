import * as Blockly from "blockly";

import ClickableTargetMutator from '../mutators/clickable_target_mutator'
import Simulation from '../../simulator/simulation'

Blockly.Blocks["task_space_pose"] = {
	init: function () {
		let i = 0;
		this.jsonInit({
			type: "task_space_pose",
			message0: "x %1 y %2 z %3 r %4 p %5 y %6",
			args0: [
				{
					"type": "field_number",
					"name": "X",
					"value": 0,
					"precision": 0.1
				},
				{
					"type": "field_number",
					"name": "Y",
					"value": 0,
					"precision": 0.1
				},
				{
					"type": "field_number",
					"name": "Z",
					"value": 0,
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
			output: "TaskspacePose",
			style: 'movement_blocks',
			tooltip:
				"Eine Pose im Arbeitsraum (definiert über die Endeffektorpose, d.h. Position und Orientierung)",
			helpUrl: "",
		});
		this.setMutator(new ClickableTargetMutator());
	},

	onClick: function (e) {
		Simulation.getInstance(sim => {
			const pose = sim.getTaskSpacePose();
			const keys = ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW'];
			for (let j = 0; j < 3; j++) {
				this.setFieldValue(pose[j].toFixed(1), keys[j]);
			}
			for (let j = 3; j < 6; j++) {
				let deg = pose[j] * 180.0 / Math.PI;
				this.setFieldValue(deg.toFixed(0), keys[j]);
			}
		});
	},
};


Blockly.JavaScript["task_space_pose"] = function (block) {
    let ret = '[';
    for (const key of ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW']) {
        ret += block.getFieldValue(key) + ', ';
    }
    ret = ret.slice(0, -1) + ']'

    return [ret, Blockly.JavaScript.ORDER_COLLECTION];
};
