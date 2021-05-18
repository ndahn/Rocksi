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
					check: "Array",
				},
			],
			inputsInline: false,
			previousStatement: null,
			nextStatement: "Array",
			style: 'movement_blocks',
			tooltip:
				"Füge rechts eine Joint oder Task Space Pose hinzu, zu der sich der Roboter bewegen soll",
			helpUrl: "",
		});
	},
};


Blockly.JavaScript["move"] = function (block) {
	var pose = Blockly.JavaScript.valueToCode(block, 'POSE', Blockly.JavaScript.ORDER_COMMA) || 0;

	var code = 'robot("move", ' + pose + ');';
	return code;
};
