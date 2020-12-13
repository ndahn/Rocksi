import * as Blockly from "blockly";

Blockly.Blocks["joint_relative"] = {
	init: function () {
		this.jsonInit({
			type: "joint_relative",
			message0: "Gelenkwinkel (relativ) %1 %2 %3",
			args0: [
				{
					"type": "field_dropdown",
					"name": "JOINT",
					"options": [
					  [
						"j1",
						"0"
					  ],
					  [
						"j2",
						"1"
					  ],
					  [
						"j3",
						"2"
					  ],
					  [
						"j4",
						"3"
					  ],
					  [
						"j5",
						"4"
					  ],
					  [
						"j6",
						"5"
					  ],
					  [
						"j7",
						"6"
					  ]
					]
				},
				{
					"type": "field_dropdown",
					"name": "SIGN",
					"options": [
					  [
						"+",
						"+"
					  ],
					  [
						"-",
						"-"
					  ],
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
				"Drehe ein einzelnes Gelenk um den angegebenen Winkel",
			helpUrl: "",
		});
	},
};


Blockly.JavaScript["joint_relative"] = function (block) {
	var joint = block.getFieldValue('JOINT');
	var sign  = block.getFieldValue('SIGN');
	var angle = block.getFieldValue('ANGLE');

	var functionName = Blockly.JavaScript.provideFunction_(
		"joint_relative",
		[
			"function " + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + "(joint, angle) {",
			"  _joint_relative_internal(joint, angle);",
			"}",
		]);
	
	var code = functionName + '(' + joint + ', ' + sign + angle + ')';
	return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};