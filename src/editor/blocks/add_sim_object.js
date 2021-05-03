import * as Blockly from 'blockly';
import { changeSimObjectType,
         changeSimObjectPosition,
         changeSimObjectOrientation,
         getSimObject,
         getSimObjectIdx,
         getSimObjects } from "../../simulator/objects/objects";

const fieldKeys = ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW'];

Blockly.Blocks['add_sim_object'] = {
	init: function () {
        var thisBlock = this;
            this.jsonInit({
                type: "add_sim_object",
                message0: "Generiert einen %1 in der Farbe %2 an Position %3",
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

                    {
                        type: "input_value",
                        name: "POSE",
                        check: "Pose",
                    },
                ],
                inputsInline: false,
                previousStatement: null,
                nextStatement: null,
                colour: "%{BKY_OBJECT_HEX}",
                tooltip: "Ich bin kein hilfreicher Tooltip!",
                helpUrl: "www.google.com",
            });},

	onchange: function (event) {

        var thisBlock = this;
        var children = thisBlock.getChildren();
        var inputChild;
        console.log('children', children);
        for (var i = 0; i < children.length; i++) {
            if (children[i].type == 'pose') {
                inputChild = children[i];
            }
        }

        if (inputChild != undefined) {
            if (event.newParentId == thisBlock.id) {
                var simObject = getSimObject(thisBlock.id);
                inputChild.setFieldValue(simObject.position.x, 'X');
                inputChild.setFieldValue(simObject.position.y, 'Y');
                inputChild.setFieldValue(simObject.position.z - simObject.size.z * 0.5, 'Z');
                inputChild.setFieldValue(simObject.rotation.x, 'ROLL');
                inputChild.setFieldValue(simObject.rotation.y, 'PITCH');
                inputChild.setFieldValue(simObject.rotation.z, 'YAW');
            }
            if (event.blockId == inputChild.id && event.name != undefined) {
                switch (event.name) {
        			case 'X':
                        var simObject = getSimObject(thisBlock.id);
                        var fieldValue = inputChild.getFieldValue('X');
                        if (fieldValue != simObject.position.x) {
                            simObject.position.x = inputChild.getFieldValue('X');
                            changeSimObjectPosition(simObject);
                        }
                        break;

                    case 'Y':
                        var simObject = getSimObject(thisBlock.id);
                        var fieldValue = inputChild.getFieldValue('Y');
                        if (fieldValue != simObject.position.y) {
                            simObject.position.y = inputChild.getFieldValue('Y');
                            changeSimObjectPosition(simObject);
                        }
                        break;

                    case 'Z':
                        var simObject = getSimObject(thisBlock.id);
                        var fieldValue = inputChild.getFieldValue('Z');
                        if (fieldValue != simObject.position.z) {
                            simObject.position.z = inputChild.getFieldValue('Z') + simObject.size.z * 0.5;
                            changeSimObjectPosition(simObject);
                        }

                        break;

                    case 'ROLL':
                        var simObject = getSimObject(thisBlock.id);
                        var fieldValue = inputChild.getFieldValue('ROLL');
                        if (fieldValue != simObject.rotation.x) {
                            simObject.rotation.x = inputChild.getFieldValue('ROLL');
                            changeSimObjectOrientation(simObject);
                        }
                        break;

                    case 'PITCH':
                        var simObject = getSimObject(thisBlock.id);
                        var fieldValue = inputChild.getFieldValue('PITCH');
                        if (fieldValue != simObject.rotation.y) {
                            simObject.rotation.y = inputChild.getFieldValue('PITCH');
                            changeSimObjectOrientation(simObject);
                        }
                        break;

                    case 'YAW':
                        var simObject = getSimObject(thisBlock.id);
                        var fieldValue = inputChild.getFieldValue('YAW');
                        if (fieldValue != simObject.rotation.z) {
                            simObject.rotation.z = inputChild.getFieldValue('YAW');
                            changeSimObjectOrientation(simObject);
                        }
                        break;

                    default:
                        console.error('Error: Can not get fieldValue for block ', inputChild.id);
                }
            }
        }
    }
};


//Should give the simulation an name to initialize the body of the
//3D Object and starts the physics engine
Blockly.JavaScript["add_sim_object"] = function (block) {
    var idx = getSimObjectIdx(this.id);
    var code = 'simulate("createPhysicalObject", ' + idx + ');'
	return code;
};
