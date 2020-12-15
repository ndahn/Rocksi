import * as Blockly from "blockly";

Blockly.Blocks["gripper_close"] = {
	deferredStep: true, 
	
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
	var code = 'sendRobotCommand("gripper_close");';
	return code;
};
