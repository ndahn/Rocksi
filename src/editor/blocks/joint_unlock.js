import * as Blockly from "blockly";

Blockly.Blocks["joint_unlock"] = {
	init: function () {
		this.jsonInit({
			type: "joint_unlock",
			message0: "Entsperre %1",
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
				  }
			],
			inputsInline: false,
			previousStatement: null,
			nextStatement: "Array",
			style: 'extras_blocks',
			tooltip:
				"Erlaubt Änderungen des Gelenkwinkels für das gewählte Gelenk",
			helpUrl: "",
		});
	},
};


Blockly.JavaScript["joint_unlock"] = function (block) {
	var joint = block.getFieldValue('JOINT');
	var code = 'robot("unlockJoint", ' + joint + ');';
	return code;
};
