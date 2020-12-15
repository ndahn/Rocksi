import * as Blockly from "blockly";

Blockly.Blocks["joint_relative"] = {
	isRobotCommandBlock: true, 
	
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

	var code = 'sendRobotCommand("joint_relative", ' + joint + ', ' + sign + angle + ');';
	return code;
};