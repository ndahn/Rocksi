import * as Blockly from "blockly";

Blockly.Blocks["move"] = {
	deferredStep: true, 
	
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
			colour: "%{BKY_MOVEMENT_HEX}",
			tooltip:
				"Füge rechts eine Joint oder Task Space Pose hinzu, zu der sich der Roboter bewegen soll",
			helpUrl: "",
		});
	},
};


Blockly.JavaScript["move"] = function (block) {
	var pose = Blockly.JavaScript.valueToCode(block, 'POSE', Blockly.JavaScript.ORDER_COMMA) || 0;

	var code = 'sendRobotCommand("move", ' + pose + ');';
	return code;
};
