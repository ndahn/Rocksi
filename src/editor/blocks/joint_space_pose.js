import * as Blockly from "blockly";

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
			colour: 210,
			tooltip:
				"Eine Pose im Gelenkwinkelraum (ein Winkel pro Gelenk, von der Basis zum Endeffektor)",
			helpUrl: "",
		});
	},
};

Blockly.JavaScript["joint_space_pose"] = function (block) {
    let ret = '[';
    for (let i = 1; i < 8; i++) {
        ret += block.getFieldValue('JOINT_' + i) + ',';
    }
	ret = ret.slice(0, -1) + ']';

    return [ret, Blockly.JavaScript.ORDER_ATOMIC];
};
