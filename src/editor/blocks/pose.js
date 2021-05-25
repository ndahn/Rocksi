import * as Blockly from "blockly";

import ClickableTargetMutator from '../mutators/clickable_target_mutator'
import Simulation from '../../simulator/simulation'

const fieldKeys = ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW'];

Blockly.Blocks["pose"] = {
	init: function () {
		let i = 0;
		this.jsonInit({
			type: "pose",
			message0: "x %1 y %2 z %3 r %4 p %5 y %6",
			args0: [
				{
					"type": "field_number",
					"name": fieldKeys[i++],
					"value": 0,
					"precision": 0.1,
				},
				{
					"type": "field_number",
					"name": fieldKeys[i++],
					"value": 0,
					"precision": 0.1,
				},
				{
					"type": "field_number",
					"name": fieldKeys[i++],
					"value": 0,
					"precision": 0.1,
				},
				{
					"type": "field_angle",
					"name": fieldKeys[i++],
					"angle": 0,
                    "precision": 0.1,
				},
				{
					"type": "field_angle",
					"name": fieldKeys[i++],
					"angle": 0,
                    "precision": 0.1,
				},
				{
					"type": "field_angle",
					"name": fieldKeys[i++],
					"angle": 0,
                    "precision": 0.1
				},
			],
			inputsInline: true,
			output: "Pose",
			colour: "%{BKY_MOVEMENT_HEX}",
			tooltip:
				"Eine Pose im Arbeitsraum (definiert über die Endeffektorpose, d.h. Position und Orientierung)",
			helpUrl: "",

		});
		this.setMutator(new ClickableTargetMutator());
	},
    onClick:function (e) {
        var parent = this.getParent();
        if (parent != null) {
            var fieldValues = parent.getPosition();
            //console.log('fieldValues Child',fieldValues);
            for (var i = 0; i < fieldValues.length; i++) {
                this.setFieldValue(fieldValues[i].toFixed(0), fieldKeys[i]);
            }
        }
	},
};



Blockly.JavaScript["pose"] = function (block) {
    let ret = '["task_space", ';
    for (const key of fieldKeys) {
        ret += block.getFieldValue(key) + ', ';
    }
    ret = ret.slice(0, -1) + ']'

    return [ret, Blockly.JavaScript.ORDER_ATOMIC];
};
