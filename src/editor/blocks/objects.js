import * as Blockly from "blockly";
import '@blockly/field-slider';
import { getSimObject,
         randomColour } from "../../simulator/objects/createObjects";
import Simulation from "../../simulator/simulation";


const fieldKeys = ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW'];

Blockly.Blocks["gripper_open"] = {
	init: function () {
		this.jsonInit({
			type: "gripper_open",
			message0: "%{BKY_ROCKSI_BLOCK_GRIPPEROPEN}",
			previousStatement: null,
			nextStatement: null,
			style: 'objects_blocks',
			tooltip: "%{BKY_ROCKSI_BLOCK_GRIPPEROPEN_TOOLTIP}",
			helpUrl: "",
		});
	},
};

Blockly.Blocks["gripper_close"] = {
	init: function () {
		this.jsonInit({
			type: "gripper_close",
			message0: "%{BKY_ROCKSI_BLOCK_GRIPPERCLOSE}",
			previousStatement: null,
			nextStatement: null,
			style: 'objects_blocks',
			tooltip: "%{BKY_ROCKSI_BLOCK_GRIPPERCLOSE_TOOLTIP}",
			helpUrl: "",
		});
	},
};

//Spawn block definition and other 3D-object interaction blocks
//The SimObject spawn block:
Blockly.Blocks['add_sim_object'] = {
	init: function () {
        this.jsonInit({
            type: "add_sim_object",
            message0: "%{BKY_ROCKSI_BLOCK_SIMOBJECT}",
            args0: [
                {
                    "type": "field_dropdown", //Menu for the shape
                    "name": "OBJECT_SHAPE",
                    "options": [
                        [
                            "%{BKY_ROCKSI_BLOCK_SIMOBJECT_CUBE}",
                            "cube"
                        ],
                        [
                            "%{BKY_ROCKSI_BLOCK_SIMOBJECT_SPHERE}",
                            "sphere"
                        ],
                        [
                            "%{BKY_ROCKSI_BLOCK_SIMOBJECT_ROCK}",
                            "rock"
                        ],
                        [
                            "%{BKY_ROCKSI_BLOCK_SIMOBJECT_SHAFT}",
                            "shaft"
                        ],
                        [
                            "%{BKY_ROCKSI_BLOCK_SIMOBJECT_CUSTOM}",
                            "custom"
                        ],
                    ]
                },
            ],
            message1: "%{BKY_ROCKSI_BLOCK_SIMOBJECT_COLOR}",
            args1: [
                {
                    type: "input_value",
                    name: "COLOUR",
                    check: "Colour",
                },
            ],
            message2: "%{BKY_ROCKSI_BLOCK_SIMOBJECT_POSITION}",
            args2:[
                {
                    type: "input_value",
                    name: "POSE",
                    check: "TaskspacePose",
                },
            ],
            message3: "%{BKY_ROCKSI_BLOCK_SIMOBJECT_SCALE}",
            args3:[
                {
                    type: "input_value",
                    name: "SCALE",
                    check: "Number",
                },
            ],
            inputsInline: false,
            previousStatement: null,
            nextStatement: null,
            style: 'objects_blocks',
            tooltip: "%{BKY_ROCKSI_BLOCK_SIMOBJECT_TOOLTIP}",
            helpUrl: "",
        });
    },

    getTaskspacePose: function () {
        let fieldValues = [];
        const simObject = getSimObject(this.id);
        if (simObject != undefined) {
            simObject.updateFieldValues();
            fieldValues = simObject.getFieldValues();
        }
        return fieldValues;
    },

    setTaskspacePose: function (pose) {
        const simObject = getSimObject(this.id);
        if (simObject !== undefined) {
            //simObject.setFieldValues(pose);
            simObject.updateFromFieldValues();
            Simulation.instance.renderCallback();
        }
    },

	onchange: function (event) {
        let simObject = getSimObject(this.id);
        if (!simObject) {
            return;
        }

        const poseBlock = this.getInputTargetBlock('POSE');
        const colorBlock = this.getInputTargetBlock('COLOUR');
        const scaleBlock = this.getInputTargetBlock('SCALE');

        if (event.blockId === this.id && event.name == 'OBJECT_SHAPE') {
            simObject.changeShape(event.newValue);
        }

        if (poseBlock !== null && event.blockId === poseBlock.id && fieldKeys.includes(event.name)) {
            let fieldValues = [];
            for (let i = 0; i < fieldKeys.length; i++) {
                fieldValues.push(poseBlock.getFieldValue(fieldKeys[i]));
            }

            simObject.setFieldValues(fieldValues);
            simObject.updateFromFieldValues();
            Simulation.instance.renderCallback();
        }

        if (scaleBlock !== null && event.blockId === scaleBlock.id) {
            simObject.setScale(event.newValue);
        }

        if (colorBlock != null) {
            let color = simObject.color;

            if (event.blockId === colorBlock.id) {
                if (colorBlock.type == 'colour_random') {
                    color = randomColour();
                }
                else if (colorBlock.type == 'colour_picker') {
                    color = colorBlock.getFieldValue('COLOUR');
                }
            }

            // Do this no matter what so the simObject updates its texture
            simObject.setColor(color);
            Simulation.instance.renderCallback();

            if (colorBlock.type == 'colour_random') {
                colorBlock.setColour(simObject.color);
            }
        }
    }
};

//The physics_done block
Blockly.Blocks["physics_done"] = {
	init: function () {
		this.jsonInit({
			type: "physics_done",
			message0: "%{BKY_ROCKSI_BLOCK_PHYSICSDONE}",
			output: "Boolean",
			style: 'objects_blocks',
			tooltip: "%{BKY_ROCKSI_BLOCK_PHYSICSDONE_TOOLTIP}",
			helpUrl: "",
		});
    }
}

//The is_attached block
Blockly.Blocks["is_attached"] = {
	init: function () {
		this.jsonInit({
			type: "is_attached",
			message0: "%{BKY_ROCKSI_BLOCK_HOLDING}",
			output: "Boolean",
			style: 'objects_blocks',
			tooltip: "%{BKY_ROCKSI_BLOCK_HOLDING_TOOLTIP}",
			helpUrl: "",
		});
    }
}
