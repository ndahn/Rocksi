import * as Blockly from "blockly";

Blockly.Blocks["set_speed"] = {
	init: function () {
		this.jsonInit({
			"type": "set_speed",
			"message0": "Geschwindigkeit %1 %2",
			"args0": [
			  {
				"type": "field_dropdown",
				"name": "MOTION_TYPE",
				"options": [
				  [
					"Bewegung",
					"move"
				  ],
				  [
					"Greifer",
					"gripper"
				  ],
				  [
					"Gelenk",
					"joint"
				  ]
				]
			  },
			  {
				"type": "field_number",
				"name": "SPEED",
				"value": 0.5,
				"min": 0.1,
				"max": 3,
				"precision": 0.1
			  }
			],
			previousStatement: null,
			nextStatement: null,
			"colour": "%{BKY_SETPARAM_HEX}",
			"tooltip": "Ändere die Bewegungsgeschwindigkeit des Roboters bei bestimmten Bewegungen.",
			"helpUrl": ""
		  });
	},
	onchange: function (event) {
		if (event.name === 'MOTION_TYPE') {
			let speed;

			switch (event.newValue) {
				case 'move':
					speed = '%{BKY_DEFAULT_SPEED_MOVE}';
					break;
				
				case 'gripper':
					speed = '%{BKY_DEFAULT_SPEED_GRIPPER}';
					break;
				
				case 'joint':
					speed = '%{BKY_DEFAULT_SPEED_JOINT}'
					break;
				
				default:
					console.error('set_speed: unknown motion type \'' + event.newValue + '\'');
			}

			speed = Blockly.utils.replaceMessageReferences(speed);
			this.setFieldValue(speed, 'SPEED');
		}
	},
};

Blockly.JavaScript["set_speed"] = function (block) {
	var motion = block.getFieldValue('MOTION_TYPE');
	var speed = block.getFieldValue('SPEED');
	
	var code = 'setSimulationParam("velocity/' + motion + '", ' + speed + ');';
	return code;
};
