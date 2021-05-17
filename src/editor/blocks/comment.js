import * as Blockly from "blockly";

Blockly.Blocks["comment"] = {
	init: function () {
		this.jsonInit({
			type: "comment",
			message0: "// %1",
			args0: [
				{
					type: "field_input",
					name: "COMMENT",
					text: ""
				}
			],
			previousStatement: null,
			nextStatement: null,
			style: 'extras_blocks',
			tooltip: "Kommentar, hat keine Auswirkungen",
			helpUrl: "",
		});
	},
};

Blockly.JavaScript["comment"] = function (block) {
	return "// " + block.getFieldValue('COMMENT');
};
