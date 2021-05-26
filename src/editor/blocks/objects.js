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

Blockly.Blocks["gripper_close"] = {
	init: function () {
		this.jsonInit({
			type: "gripper_close",
			message0: "Greifer schließen",
			previousStatement: null,
			nextStatement: null,
			style: 'objects_blocks',
			tooltip: "Schließt den Greifer vollständig",
			helpUrl: "",
		});
	},
};

