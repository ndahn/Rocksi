import * as Blockly from "blockly";


Blockly.Blocks["scale"] = {
	init: function () {
		this.jsonInit({
			type: "scale",
			message0: "%1",
			args0: [
				{
					type: "field_slider",
					name: "NUM",
					value: 1,
					min: 0.1,
                    max: 10,
                    precision: 0.1,
				}
			],
			output: 'Number',
			style: 'math_blocks',
			tooltip: "Eine Zahl, die mit einem Schieber eingestellt werden kann",
			helpUrl: "",
		});
	},
};