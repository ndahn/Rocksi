import * as Blockly from "blockly";

Blockly.Blocks["gripper_close"] = {
	init: function () {
		this.jsonInit({
			type: "gripper_close",
			message0: "Greifer schließen",
			previousStatement: null,
			nextStatement: null,
			colour: 120,
			tooltip: "Schließt den Greifer vollständig",
			helpUrl: "",
		});
	},
};

Blockly.JavaScript["gripper_close"] = function (block) {
	var functionName = Blockly.JavaScript.provideFunction_(
		"gripper_close",
		[
			"function " + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + "() {",
			"  simulation('gripper_close');",
			"}",
		]);
	
	var code = functionName + "()";
	return code;
};
