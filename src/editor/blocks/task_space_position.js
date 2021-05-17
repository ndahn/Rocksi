import * as Blockly from "blockly";

import ClickableTargetMutator from '../mutators/clickable_target_mutator'
import Simulation from '../../simulator/simulation'

const fieldKeys = ['X', 'Y', 'Z'];

Blockly.Blocks["task_space_position"] = {
	init: function () {
		let i = 0;
		this.jsonInit({
			type: "task_space_position",
			message0: "x %1 y %2 z %3",
			args0: [
				{
					"type": "field_number",
					"name": fieldKeys[i++],
					"value": 0,
					"precision": 0.1
				},
				{
					"type": "field_number",
					"name": fieldKeys[i++],
					"value": 0,
					"precision": 0.1
				},
				{
					"type": "field_number",
					"name": fieldKeys[i++],
					"value": 0,
					"precision": 0.1
				},
			],
			inputsInline: true,
			output: "Array",
			style: 'movement_blocks',
			tooltip:
				"Eine Position im Arbeitsraum (definiert über die Position des Endeffektors)",
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
		});
	},
};


Blockly.JavaScript["task_space_position"] = function (block) {
    let ret = '["task_space", ';
    for (const key of fieldKeys) {
        ret += block.getFieldValue(key) + ', ';
    }
    ret = ret.slice(0, -1) + ']'

    return [ret, Blockly.JavaScript.ORDER_ATOMIC];
};
