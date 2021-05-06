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


//Should give the simulation an name to initialize the body of the
//3D Object and starts the physics engine
Blockly.JavaScript["add_sim_object"] = function (block) {
    var idx = getSimObjectIdx(this.id);
    var code = 'robot("startPhysicalBody", ' + idx + ');'
	return code;
};
