import * as Blockly from "blockly";
import Simulation from '../../simulator/simulation'

Blockly.Blocks["move"] = {
	deferredStep: true,

	init: function () {
		this.jsonInit({
			type: "move",
			message0: "Bewegung %1",
			args0: [
				{
					type: "input_value",
					name: "POSE",
                    check: ["Pose", "Array"],
				},
			],
			inputsInline: false,
			previousStatement: null,
			nextStatement: "Array",
			colour: "%{BKY_MOVEMENT_HEX}",
			tooltip:
				"Füge rechts eine Joint oder Task Space Pose hinzu, zu der sich der Roboter bewegen soll",
			helpUrl: "",

		});},
        getPosition: function () {
            let pose = [];
            Simulation.getInstance(sim => {
                pose = sim.getTaskSpacePose();
                for (let j = 0; j < 3; j++) {
                    pose[j] = pose[j].toFixed(1);
                }
                for (let j = 3; j < 6; j++) {
                    pose[j] = pose[j] * 180.0 / Math.PI;
                    pose[j] = pose[j].toFixed(0);
                }
            });
            return pose;
        }
};


Blockly.JavaScript["move"] = function (block) {
	var pose = Blockly.JavaScript.valueToCode(block, 'POSE', Blockly.JavaScript.ORDER_COMMA) || 0;

	var code = 'simulateAsync("move", ' + pose + ');';
	return code;
};
