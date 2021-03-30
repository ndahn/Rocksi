import * as Blockly from 'blockly';
//create3dObject
import {changeSimObject, simObject, getSimObject} from "../../simulator/objects/create3dObject";


Blockly.Blocks['addSimObject'] = {
	init: function () {
        var thisBlock = this;
		this.jsonInit({
			"type": "addObject",
			"message0": "Objekt: Typ: %1 x: %2 y: %3 z: %4 rot z: %5",
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
				"value": 5,
				"min": -10,
				"max": 10,
				"precision": 0.01
              },
              {
                "type": "field_number",
                "name": "POSITION_Y",
                "value": 5,
                "min": -10,
                "max": 10,
                "precision": 0.01
            },
            {
              "type": "field_number",
              "name": "POSITION_Z",
              "value": 5,
              "min": -10,
              "max": 10,
              "precision": 0.01            },
            {
              "type": "field_angle",
              "name": "ROT_Z",
              "value": 0,
              "min": 0.,
              "max": 360,
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
        var thisSimObject = new simObject;
        thisSimObject.name = thisBlock.id;
        thisSimObject = getSimObject(thisSimObject)
        console.log('thisSimObject.name before switch', thisSimObject)
		if (event.name === 'OBJECT_TYPE') {
            console.log()
			switch (event.newValue) {
				case 'cube':
                    thisSimObject.type = 'cube';
                    changeSimObject(thisSimObject);
					break;
                case 'cylinder':
                    thisSimObject.type = 'cylinder';
                    console.log('thisSimObject cylinder switch', thisSimObject)
                    changeSimObject(thisSimObject);
                    break;
                default:
    				console.error('Error: ');
			}
		}
        if (event.name === 'POSITION_X') {

        }
        if (event.name === 'POSITION_Y') {

        }
        if (event.name === 'POSITION_Z') {

        }
        if (event.name === 'ROT_Z') {

        }

	},
};
