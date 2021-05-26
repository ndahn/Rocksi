import * as Blockly from 'blockly';
import { getSimObject,
         getSimObjectIdx,
         randomColour } from "../../simulator/objects/objects";

import { Euler } from "three"

const fieldKeys = ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW'];
// pi/180 approximation:
const d2r = .017
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
        var thisBlock = this;
        var fieldValues = [];
        var simObject = getSimObject(thisBlock.id);
        if (simObject != undefined) {
            fieldValues = simObject.getValues()
        }
        return fieldValues;
    },

	onchange: function (event) {
        var thisBlock = this;
        var children = thisBlock.getChildren();
        var inputChild;
        var colourChild;
        for (var i = 0; i < children.length; i++) {
            if (children[i].type == 'pose') {
                inputChild = children[i];
            }
            if (children[i].type == 'colour_picker') {
                colourChild = children[i];
            }
            if (children[i].type == 'colour_random') {
                colourChild = children[i];
            }
        }

        if (inputChild != undefined && event.blockId === inputChild.id && fieldKeys.includes(event.name)) {
            var simObject = getSimObject(thisBlock.id);
            var fieldValues = [];
            for (let i = 0; i < fieldKeys.lenght; i++) {
                fieldValues.push(inputChild.getFieldValue(fieldKeys[i]));
            }
            simObject.setValues(fieldValues);
            simObject.render();
        }

        if (colourChild != undefined && event.blockId === colourChild.id) {
            var simObject = getSimObject(thisBlock.id);

            if (colourChild.type == 'colour_random') {
                var colour = randomColour();
                console.log('Colour: ',colour);
            }

            if (colourChild.type == 'colour_picker') {
                var colour = colourChild.getFieldValue('COLOUR');
                console.log('Colour: ',colour);
            }

            simObject.setColour(colour);
            simObject.render();
        }
    }
};


//Should give the simulation an name to initialize the body of the
//3D Object and starts the physics engine
Blockly.JavaScript["add_sim_object"] = function (block) {
    var idx = getSimObjectIdx(this.id);
    var code = 'robot("startPhysicalBody", ' + idx + ');'
	return code;
};
