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

            fieldValues.push(simObject.spawnPosition.x);
            fieldValues.push(simObject.spawnPosition.y);
            fieldValues.push(simObject.spawnPosition.z - 0.5 * simObject.size.z);

            var rx = simObject.spawnRotation.x * 180.0 / Math.PI;
            fieldValues.push(rx);

            var ry = simObject.spawnRotation.y * 180.0 / Math.PI;
            fieldValues.push(ry);

            var rz = simObject.spawnRotation.z * 180.0 / Math.PI;
            fieldValues.push(rz);
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

            simObject.spawnPosition.x = inputChild.getFieldValue('X');
            simObject.spawnPosition.y = inputChild.getFieldValue('Y');
            simObject.spawnPosition.z = inputChild.getFieldValue('Z') + simObject.size.z * 0.5;

            rx = inputChild.getFieldValue('ROLL');
            ry = inputChild.getFieldValue('PITCH');
            rz = inputChild.getFieldValue('YAW');

            rx * Math.PI / 180.0;
            ry * Math.PI / 180.0;
            rz * Math.PI / 180.0;

            var fieldRotation = new Euler(rx.toFixed(1), ry.toFixed(1), rz.toFixed(1));
            simObject.spawnRotation.copy(fieldRotation);

            simObject.setRotationFromEuler(simObject.spawnRotation);
            simObject.position.copy(simObject.spawnPosition);

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
