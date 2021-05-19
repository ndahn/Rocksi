import * as Blockly from "blockly";

Blockly.Blocks["gripper_open"] = {
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
	var code = 'robot("gripper_open");';
	return code;
};
