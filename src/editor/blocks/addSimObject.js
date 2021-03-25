import * as Blockly from 'blockly';
//create3dObject
import update3dobjects from "../../simulator/objects/create3dObject";
import get3dobjects from "../../simulator/objects/create3dObject";

Blockly.Blocks['addSimObject'] = {
	init: function () {
        var thisBlock = this;
		this.jsonInit({
			"type": "addObject",
			"message0": "Objekt: %1 %2 %3 %4",
			"args0": [
			  {
				"type": "field_dropdown",
				"name": "OBJECT_TYPE",
				"options": [
				  [
					"Würfel",
					"cube"
                  ],
                  [
                    "Zylinder",
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
        //this is it... IDEA: I need to tell create3dObject thisBlock.id 
        var thisBlock = this;
        console.log(thisBlock.id);
		if (event.name === 'OBJECT_TYPE') {
            console.log()
			switch (event.newValue) {
				case 'cube':

					break;
                case 'cylinder':

                    break;
                default:
    				console.error('Error: ');
			}
		}

	},
};
