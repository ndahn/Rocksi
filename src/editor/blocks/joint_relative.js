import * as Blockly from "blockly";
import Simulation from "../../simulator/simulation";

Blockly.Blocks["joint_relative"] = {
	init: function () {
		const sim = Simulation.instance;
		this.numJoints = sim.robot.arm.movable.length;
		let the_options = [];

		for (let i = 1; i <= this.numJoints; i++) {
			the_options.push(['j' + i, i.toString()]);
		}

		this.jsonInit({
			type: "joint_relative",
			message0: "Gelenkwinkel (relativ) %1 %2",
			args0: [
				{
					"type": "field_dropdown",
					"name": "JOINT",
					"options": the_options
				},
				{
					"type": "field_angle",
					"name": "DEGREES",
					"angle": 0
				}
			],
			inputsInline: false,
			previousStatement: null,
			nextStatement: null,
			style: "movement_blocks",
			tooltip:
				"Drehe ein einzelnes Gelenk um den angegebenen Winkel",
			helpUrl: "",
		});
	},
};


Blockly.JavaScript["joint_relative"] = function (block) {
	let joint = block.getFieldValue('JOINT');
	let angle = block.getFieldValue('DEGREES');

	return code = 'robot("joint_relative", ' + joint + ', ' + angle + ');';
};