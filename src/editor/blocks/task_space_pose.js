import * as Blockly from "blockly";

Blockly.Blocks["task_space_pose"] = {
	init: function () {
		this.jsonInit({
			type: "task_space_pose",
			message0: "x %1 y %2 z %3 yaw %4 pitch %5 roll %6",
			args0: [
				{
					type: "field_angle",
					name: "X",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "Y",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "Z",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "YAW",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "PITCH",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "ROLL",
					angle: 0,
				},
			],
			inputsInline: true,
			output: "Array",
			colour: 210,
			tooltip:
				"Eine Pose im Arbeitsraum (definiert über die Endeffektorpose, Position und Orientierung)",
			helpUrl: "",
		});
	},
};


Blockly.JavaScript["task_space_pose"] = function (block) {
    let ret = '[';
    for (const key of ['X', 'Y', 'Z', 'YAW', 'PITCH', 'ROLL']) {
        ret += block.getFieldValue(key) + ',';
    }
    ret = ret.slice(0, -1) + ']'

    return [ret, Blockly.JavaScript.ORDER_ATOMIC];
};
