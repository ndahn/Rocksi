import * as Blockly from "blockly";

Blockly.Blocks["wait"] = {
	init: function () {
		this.jsonInit({
			type: "wait",
			message0: "Warte %1 Sekunden",
			args0: [
				{
					"type": "field_number",
					"name": "TIME",
					"value": 1,
					"min": 0,
					"precision": 1
				}
			],
			previousStatement: null,
			nextStatement: null,
			style: 'extras_blocks',
			tooltip: "Warte eine bestimmte Zeit, bevor der nächste Block ausgeführt wird",
			helpUrl: "",
		});
	},
};

Blockly.JavaScript["wait"] = function (block) {
	var time = block.getFieldValue('TIME');
	var code = 'robot("wait", ' + (time * 1000) + ');';
	return code;
};
