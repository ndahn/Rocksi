import * as Blockly from "blockly";

Blockly.Blocks["joint_space_pose"] = {
	init: function () {
		this.jsonInit({
			type: "joint_space_pose",
			message0: "j0 %1 j1 %2 j2 %3 j3 %4 j4 %5 j5 %6 j6 %7",
			args0: [
				{
					type: "field_angle",
					name: "j0",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "j1",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "j2",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "j3",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "j4",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "j5",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "j6",
					angle: 0,
				},
			],
			inputsInline: true,
			output: "Array",
			colour: 210,
			tooltip:
				"Eine Pose im Gelenkwinkelraum (ein Winkel pro Gelenk, von der Basis zum Endeffektor)",
			helpUrl: "",
		});
	},
};

Blockly.JavaScript["joint_space_pose"] = function (block) {
    let ret = '[';
    for (let i = 0; i < 7; i++) {
        ret += block.getFieldValue('j' + i) + ',';
    }
    ret += ']'

    return [ret, Blockly.JavaScript.ORDER_ATOMIC];
};
