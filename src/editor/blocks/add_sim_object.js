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
         getSimObject } from "../../simulator/objects/objects";

import { Euler } from "three"

const fieldKeys = ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW'];
// pi/180 approximation:
const r2d = .017
// euler angles...
var rx, ry, rz;

Blockly.Blocks['add_sim_object'] = {
	init: function () {
        var thisBlock = this;
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
                    "type": "field_colour",
                    "name": "OBJECT_COLOUR",
                    "colour": "#ff4040",
                    "colourOptions":
                        ['#ff4040', '#ff8080', '#ffc0c0',
                        '#4040ff', '#8080ff', '#c0c0ff'],
                    "colourTitles":
                        ['dark pink', 'pink', 'light pink',
                        'dark blue', 'blue', 'light blue'],
                    "columns": 3
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
            colour: "%{BKY_SIM_OBJECTS_HEX}",
            tooltip: "Ich bin kein hilfreicher Tooltip!",
            helpUrl: "www.google.com",
        });
    },
    getPosition: function () {
        var thisBlock = this;
        var fieldValues = [];
        var simObject = getSimObject(thisBlock.id);
        var xyz = ['x', 'y', 'z'];
        for (var i = 0; i < 2; i++) {
            fieldValues.push(simObject.position[xyz[i]]);
        }
        fieldValues.push(simObject.position.z - simObject.size.z * 0.5)
        for (var i = 0; i < 3; i++) {
            fieldValues.push(simObject.rotation[xyz[i]]);
        }
        return fieldValues;
    },
	onchange: function (event) {

        var thisBlock = this;
        var children = thisBlock.getChildren();
        var inputChild;
        //console.log('children', children);
        for (var i = 0; i < children.length; i++) {
            if (children[i].type == 'pose') {
                inputChild = children[i];
            }
        }

        if (inputChild != undefined) {
            //If a pose block is attached, fill the field values.
            if (event.newParentId == thisBlock.id) {
                var simObject = getSimObject(thisBlock.id);
                inputChild.setFieldValue(simObject.position.x, 'X');
                inputChild.setFieldValue(simObject.position.y, 'Y');
                inputChild.setFieldValue(simObject.position.z - simObject.size.z * 0.5, 'Z');
                inputChild.setFieldValue(simObject.rotation.x, 'ROLL');
                inputChild.setFieldValue(simObject.rotation.y, 'PITCH');
                inputChild.setFieldValue(simObject.rotation.z, 'YAW');
            }
            //If a field value changes, change the simObject position and orientation.
            if (event.blockId == inputChild.id && fieldKeys.includes(event.name)) {
                var simObject = getSimObject(thisBlock.id);
                simObject.position.x = inputChild.getFieldValue('X');
                simObject.position.y = inputChild.getFieldValue('Y');
                simObject.position.z = inputChild.getFieldValue('Z') + simObject.size.z * 0.5;
                rx = inputChild.getFieldValue('ROLL') * r2d;
                ry = inputChild.getFieldValue('PITCH') * r2d;
                rz = inputChild.getFieldValue('YAW') * r2d;
                simObject.setRotationFromEuler(new Euler(rx, ry, rz));
                console.log(simObject.rotation);
                changeSimObjectPosition();
                //changeSimObjectOrientation(simObject);
            }
        }
        //change the object type
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
                    console.error('Error: Can not change object Type of ', thisBlock.id);
            }
        }
    }
};

<<<<<<< HEAD
>>>>>>> bd6d1c4 (Changed file names and added pose block)
=======

>>>>>>> 650b26d (The add_sim_object block now gets the position and orientation from an attached pose block. Added a colour picker to the add_sim_object block)
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
