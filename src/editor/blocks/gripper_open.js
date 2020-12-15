import * as Blockly from "blockly";

Blockly.Blocks["gripper_open"] = {
	isRobotCommandBlock: true, 
	
	init: function () {
		this.jsonInit({
			type: "gripper_open",
			message0: "Greifer öffnen",
			previousStatement: null,
			nextStatement: null,
			colour: 120,
			tooltip: "Öffnet den Greifer auf volle Weite",
			helpUrl: "",
		});
	},
};

Blockly.JavaScript["gripper_open"] = function (block) {
	var code = 'sendRobotCommand("gripper_open");';
	return code;
};
