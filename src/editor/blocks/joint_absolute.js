import * as Blockly from "blockly";

Blockly.Blocks["joint_absolute"] = {
	init: function () {
		this.jsonInit({
			type: "joint_absolute",
			message0: "Gelenkwinkel (absolut) %1 %2",
			args0: [
				{
					"type": "field_dropdown",
					"name": "JOINT",
					"options": [
					  [
						"j1",
						"1"
					  ],
					  [
						"j2",
						"2"
					  ],
					  [
						"j3",
						"3"
					  ],
					  [
						"j4",
						"4"
					  ],
					  [
						"j5",
						"5"
					  ],
					  [
						"j6",
						"6"
					  ],
					  [
						"j7",
						"7"
					  ]
					]
				  },
				  {
					"type": "field_angle",
					"name": "ANGLE",
					"angle": 0
				  }
			],
			inputsInline: false,
			previousStatement: null,
			nextStatement: "Array",
			colour: 300,
			tooltip:
				"Bewege ein einzelnes Gelenk in eine bestimmte Position",
			helpUrl: "",
		});
	},
};


Blockly.JavaScript["joint_absolute"] = function (block) {
	var joint = block.getFieldValue('JOINT');
	var angle = block.getFieldValue('ANGLE');

	var functionName = Blockly.JavaScript.provideFunction_(
		"joint_absolute",
		[
			"function " + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + "(joint, angle) {",
			"  simulation('joint_absolute', joint, angle);",
			"}",
		]);
	
	var code = functionName + '(' + joint + ', ' + angle + ')';
	return code;
};
