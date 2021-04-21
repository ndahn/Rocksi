import * as Blockly from 'blockly';
import { changeSimObjectType,
         changeSimObjectPosition,
         changeSimObjectOrientation,
         getSimObject,
         getSimObjectIdx,
         getSimObjects } from "../../simulator/objects/objects";


Blockly.Blocks['addSimObject'] = {
	init: function () {
        var thisBlock = this;
		this.jsonInit({
			"type": "addSimObject",
			"message0": "Objekt: Typ: %1 x: %2 y: %3 z: %4 rot x: %5 rot y: %6 rot z: %7",
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
              "value": 0.25,
              "min": 0,
              "max": 10,
              "precision": 0.01
            },
            {
              "type": "field_angle",
              "name": "ROT_X",
              "value": 0,
              "min": 0,
              "max": 360,
              "precision": 1
            },
            {
              "type": "field_angle",
              "name": "ROT_Y",
              "value": 0,
              "min": 0,
              "max": 360,
              "precision": 1
            },
            {
              "type": "field_angle",
              "name": "ROT_Z",
              "value": 0,
              "min": 0,
              "max": 360,
              "precision": 1
            }
			],
            "previousStatement": null,
            "nextStatement": null,
			"colour": "",
			"tooltip": "",
			"helpUrl": ""
		  });
	},
	onchange: function (event) {
        var thisBlock = this;
		if (event.name === 'OBJECT_TYPE' && event.blockId == thisBlock.id) {
			switch (event.newValue) {
    			case 'cube':
                    console.log('You are changing Block.id: ', thisBlock.id);
                    changeSimObjectType(thisBlock.id, 'cube');
					break;
                case 'cylinder':
                    console.log('You are changing Block.id: ', thisBlock.id);
                    changeSimObjectType(thisBlock.id, 'cylinder');
                    break;
                default:
    				console.error('Error: ');
			}
		}

        if (event.name === 'POSITION_X' && event.blockId == thisBlock.id) {
            var simObject = getSimObject(thisBlock.id);
            var fieldValue = thisBlock.getFieldValue('POSITION_X');
            if (fieldValue != simObject.position.x) {
                simObject.position.x = thisBlock.getFieldValue('POSITION_X');
                changeSimObjectPosition(simObject);
            }
        }

        if (event.name === 'POSITION_Y' && event.blockId == thisBlock.id) {
            var simObject = getSimObject(thisBlock.id);
            var fieldValue = thisBlock.getFieldValue('POSITION_Y');
            if (fieldValue != simObject.position.y) {
                simObject.position.y = thisBlock.getFieldValue('POSITION_Y');
                changeSimObjectPosition(simObject);
            }
        }

        if (event.name === 'POSITION_Z' && event.blockId == thisBlock.id) {
            var simObject = getSimObject(thisBlock.id);
            var fieldValue = thisBlock.getFieldValue('POSITION_Z');
            if (fieldValue != simObject.position.z) {
                simObject.position.z = thisBlock.getFieldValue('POSITION_Z');
                changeSimObjectPosition(simObject);
            }
        }

        if (event.name === 'ROT_X' && event.blockId == thisBlock.id) {
            var simObject = getSimObject(thisBlock.id);
            var fieldValue = thisBlock.getFieldValue('ROT_X');
            if (fieldValue != simObject.rotation.x) {
                simObject.rotation.x = thisBlock.getFieldValue('ROT_X');
                changeSimObjectPosition(simObject);
            }
        }

        if (event.name === 'ROT_Y' && event.blockId == thisBlock.id) {
            var simObject = getSimObject(thisBlock.id);
            var fieldValue = thisBlock.getFieldValue('ROT_X');
            if (fieldValue != simObject.rotation.x) {
                simObject.rotation.x = thisBlock.getFieldValue('ROT_X');
                changeSimObjectPosition(simObject);
            }
        }

        if (event.name === 'ROT_Z' && event.blockId == thisBlock.id) {
            var simObject = getSimObject(thisBlock.id);
            var fieldValue = thisBlock.getFieldValue('ROT_X');
            if (fieldValue != simObject.rotation.x) {
                simObject.rotation.x = thisBlock.getFieldValue('ROT_X');
                changeSimObjectPosition(simObject);
            }
        }
	},
};

//Should give the simulation an name to initialize the body of the
//3D Object and starts the physics engine
Blockly.JavaScript["addSimObject"] = function (block) {
    var idx = getSimObjectIdx(this.id);
    var code = 'simulate("createPhysicalObject", ' + idx + ');'
	return code;
};
