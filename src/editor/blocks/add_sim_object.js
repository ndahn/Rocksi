import * as Blockly from 'blockly';
<<<<<<< HEAD
import { getSimObject,
         getSimObjectIdx,
         randomColour } from "../../simulator/objects/objects";

import { Euler } from "three"

const fieldKeys = ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW'];

Blockly.Blocks['add_sim_object'] = {
	init: function () {
        this.jsonInit({
            type: "add_sim_object",
            message0: "Generiert einen %1",
            args0: [
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
            ],
            message1: "in der Farbe %1 ",
            args1: [
                {
                    type: "input_value",
                    name: "COLOUR",
                    check: "Colour",
                },
            ],
            message2: "an Position %1 ",
            args2:[
                {
                    type: "input_value",
                    name: "POSE",
                    check: "Pose",
                },
            ],
            inputsInline: false,
            previousStatement: null,
            nextStatement: null,
            style: 'objects_blocks',
            tooltip: "Fügt ein Objekt hinzu, diese wird zur Laufzeit erstellt.",
            helpUrl: "",
        });
    },

    getPosition: function () {
        let fieldValues = [];
        const simObject = getSimObject(this.id);

        if (simObject != undefined) {
            fieldValues = simObject.getFieldValues();
        }
        return fieldValues;
    },

	onchange: function (event) {
        const pose = this.getInputTargetBlock('POSE');
        const colour = this.getInputTargetBlock('COLOUR');
        if (pose != null && event.blockId === pose.id && fieldKeys.includes(event.name)) {
            let fieldValues = [];
            const simObject = getSimObject(this.id)
            for (let i = 0; i < fieldKeys.length; i++) {
                fieldValues.push(pose.getFieldValue(fieldKeys[i]));
            }
            simObject.setFieldValues(fieldValues);
            simObject.updateFromFieldValues();
            simObject.render();
        }

        if (colour != null && event.blockId === colour.id) {
            var simObject = getSimObject(this.id);

            if (colour.type == 'colour_random') {
                var ranColour = randomColour();
                simObject.setColour(ranColour);
            }

            if (colour.type == 'colour_picker') {
                var pickColour = colour.getFieldValue('COLOUR');
                simObject.setColour(pickColour);
            }

            simObject.render();
        }
    }
};


=======
import { changeSimObjectType,
         changeSimObjectPosition,
         changeSimObjectOrientation,
         getSimObject,
         getSimObjectIdx,
         getSimObjects } from "../../simulator/objects/objects";


Blockly.Blocks['add_sim_object'] = {
	init: function () {
        var thisBlock = this;
		this.jsonInit({
			"type": "add_sim_object",
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

>>>>>>> bd6d1c4 (Changed file names and added pose block)
//Should give the simulation an name to initialize the body of the
//3D Object and starts the physics engine
Blockly.JavaScript["add_sim_object"] = function (block) {
    var idx = getSimObjectIdx(this.id);
<<<<<<< HEAD
    var code = 'robot("startPhysicalBody", ' + idx + ');'
=======
    var code = 'simulate("createPhysicalObject", ' + idx + ');'
>>>>>>> bd6d1c4 (Changed file names and added pose block)
	return code;
};
