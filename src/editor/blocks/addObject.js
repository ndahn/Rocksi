import * as Blockly from 'blockly';
//create3dObject
import create3dObject from "../../simulator/objects/create3dObject";

Blockly.Blocks["addObject"] = {
	init: function () {
		this.jsonInit({
			"type": "addObject",
			"message0": "Objekt: %1 %2 %3 %4",
			"args0": [
			  {
				"type": "field_dropdown",
				"name": "OBJECT_TYPE",
				"options": [
                  [
                    "Bitte Objekttyp wählen",
                    "nothing"
                  ],
				  [
					"Würfel",
					"cube"
                  ],
                  [
                    "Wurst",
                    "cylinder"
                    ],
				]
			  },
			  {
				"type": "field_number",
				"name": "POSITION_X",
				"value": 0.5,
				"min": 0.01,
				"max": 3,
				"precision": 0.01
              },
              {
                "type": "field_number",
                "name": "POSITION_Y",
                "value": 0.5,
                "min": 0.01,
                "max": 3,
                "precision": 0.01
            },
            {
              "type": "field_number",
              "name": "POSITION_Z",
              "value": 0.5,
              "min": 0.01,
              "max": 3,
              "precision": 0.01
            }
			],
			"colour": "",
			"tooltip": "",
			"helpUrl": ""
		  });
	},
	onchange: function (event) {
		if (event.name === 'OBJECT_TYPE') {
			switch (event.newValue) {
                case 'nothing':
                    console.log("New Kids from the Block");
                    create3dObject();
					break;
				case 'cube':
                    console.log("New Kids from the Block");
                    create3dObject();
					break;
                case 'cylinder':
                    console.log("New Kids from the Block");
                    break;
                default:
    				console.error('set_speed: unknown motion type \'' + event.newValue + '\'');
			}
		}
        if (event.name === Blockly.Events.DELETE) {
            console.log("no more blockly please");
        }
	},
};
