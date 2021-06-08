import * as Blockly from "blockly";
import { getSimObject,
         getSimObjectIdx,
         randomColour,
         isAttached } from "../../simulator/objects/createObjects";


const fieldKeys = ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW'];

Blockly.Blocks["gripper_open"] = {
	init: function () {
		this.jsonInit({
			type: "gripper_open",
			message0: "Greifer öffnen",
			previousStatement: null,
			nextStatement: null,
			style: 'objects_blocks',
			tooltip: "Öffnet den Greifer auf volle Weite",
			helpUrl: "",
		});
	},
};

Blockly.Blocks["gripper_close"] = {
	init: function () {
		this.jsonInit({
			type: "gripper_close",
			message0: "Greifer schließen",
			previousStatement: null,
			nextStatement: null,
			style: 'objects_blocks',
			tooltip: "Schließt den Greifer vollständig",
			helpUrl: "",
		});
	},
};

//simObjects stuff, Lukas

//The SimObject:
Blockly.Blocks['add_sim_object'] = {
	init: function () {
        this.jsonInit({
            type: "add_sim_object",
            message0: "Generiert einen %1",
            args0: [
                {
                    "type": "field_dropdown",
                    "name": "OBJECT_SHAPE",
                    "options": [
                        [
                            "Würfel",
                            "cube"
                        ],
                        [
                            "Stein",
                            "rock"
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
                    check: "TaskspacePose",
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

    getTaskspacePose: function () {
        let fieldValues = [];
        const simObject = getSimObject(this.id);

        if (simObject != undefined) {
            simObject.setSpawnPosition();
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

        if (event.blockId === this.id && event.name == 'OBJECT_SHAPE') {
            var simObject = getSimObject(this.id);
            simObject.changeShape(event.newValue);
        }
    }
};

//The physics_done block
Blockly.Blocks["physics_done"] = {
	init: function () {
		this.jsonInit({
			type: "physics_done",
			message0: "Physiksimulation abgeschlossen?",
			output: "Boolean",
			style: 'objects_blocks',
			tooltip:
				"Gibt Wahr zurück solange sich noch Objekte bewegen (nicht der Roboter).",
			helpUrl: "",
		});
    }
}

//The is_attached block
Blockly.Blocks["is_attached"] = {
	init: function () {
		this.jsonInit({
			type: "is_attached",
			message0: "Gegriffen?",
			output: "Boolean",
			style: 'objects_blocks',
			tooltip:
				"Gibt Wahr zurück wenn der Roboter etwas gegriffen hat",
			helpUrl: "",
		});
    }
}
