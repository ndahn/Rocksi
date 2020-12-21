import * as Blockly from "blockly";

Blockly.Blocks["joint_lock"] = {
	deferredStep: false, 
	
	init: function () {
		this.jsonInit({
			type: "joint_lock",
			message0: "Sperre %1",
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
			colour: "%{BKY_SETPARAM_HEX}",
			tooltip:
				"Verhindert Änderungen des Gelenkwinkels für das gewählte Gelenk",
			helpUrl: "",
		});
	},
};


Blockly.JavaScript["joint_lock"] = function (block) {
	var joint = block.getFieldValue('JOINT');
	var code = 'simulate("lockJoint", ' + joint + ');';
	return code;
};
