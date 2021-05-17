import * as Blockly from "blockly";

Blockly.Blocks["gripper_open"] = {
	deferredStep: true, 
	
	init: function () {
		this.jsonInit({
			type: "gripper_open",
			message0: "Greifer öffnen",
			previousStatement: null,
			nextStatement: null,
			style: 'objects_blocks',
			tooltip: "Öffnet den Greifer auf volle Weite",
			helpUrl: "",
		});
	},
};

Blockly.JavaScript["gripper_open"] = function (block) {
	var code = 'simulateAsync("gripper_open");';
	return code;
};
