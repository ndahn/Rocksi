import * as Blockly from "blockly";


Blockly.Blocks["scale"] = {
	init: function () {
		this.jsonInit({
			type: "scale",
			message0: "%{BKY_ROCKSI_BLOCK_SCALE}",
			args0: [
				{
					type: "field_slider",
					name: "NUM",
					value: 1,
					min: 0.01,
                    max: 10,
                    precision: 0.1,
				}
			],
			output: 'Number',
			style: 'math_blocks',
			tooltip: "%{BKY_ROCKSI_BLOCK_SCALE_TOOLTIP}",
			helpUrl: "",
		});
	},
};