import * as Blockly from "blockly";

Blockly.Blocks["move"] = {
	init: function () {
		this.jsonInit({
			type: "move",
			message0: "Bewegung %1",
			args0: [
				{
					type: "input_value",
					name: "POSE",
					check: ["JointspacePose", "TaskspacePose"],
				},
			],
			inputsInline: false,
			previousStatement: null,
			nextStatement: null,
			style: 'movement_blocks',
			tooltip:
				"Füge rechts eine Joint oder Task Space Pose hinzu, zu der sich der Roboter bewegen soll",
			helpUrl: "",
		});
	},
};


Blockly.JavaScript["move"] = function (block) {
	let pose = Blockly.JavaScript.valueToCode(block, 'POSE', Blockly.JavaScript.ORDER_COMMA) || 0;
	let poseType = block.getInputTargetBlock('POSE').outputConnection.getCheck()[0];

	var code = 'robot("move", "' + poseType + '", ' + pose + ');';
	return code;
};
