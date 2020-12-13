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
			colour: 210,
			tooltip:
				"Füge rechts eine Joint oder Task Space Pose hinzu, zu der sich der Roboter bewegen soll",
			helpUrl: "",
		});
	},
};


Blockly.JavaScript["move"] = function (block) {
	var pose = Blockly.JavaScript.valueToCode(block, 'POSE', Blockly.JavaScript.ORDER_COMMA) || 0;

	var functionName = Blockly.JavaScript.provideFunction_(
		"move",
		[
			"function " + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + "(pose) {",
			"  _move_internal(pose);",
			"}",
		]);
	
	var code = functionName + '(' + pose + ')';
	return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};
