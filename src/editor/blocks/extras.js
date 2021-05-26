import * as Blockly from "blockly";
import Simulation from "../../simulator/simulation";


Blockly.Blocks["comment"] = {
	init: function () {
		this.jsonInit({
			type: "comment",
			message0: "Kommentar %1",
			args0: [
				{
					type: "field_input",
					name: "COMMENT",
					text: ""
				}
			],
			previousStatement: null,
			nextStatement: null,
			style: 'extras_blocks',
			tooltip: "Kommentar, hat keine Auswirkungen",
			helpUrl: "",
		});
	},
};

Blockly.Blocks["wait"] = {
	init: function () {
		this.jsonInit({
			type: "wait",
			message0: "Warte %1 Sekunden",
			args0: [
				{
					"type": "field_number",
					"name": "SECONDS",
					"value": 1,
					"min": 0,
					"precision": 1
				}
			],
			previousStatement: null,
			nextStatement: null,
			style: 'extras_blocks',
			tooltip: "Warte eine bestimmte Zeit, bevor der nächste Block ausgeführt wird",
			helpUrl: "",
		});
	},
};

Blockly.Blocks["set_speed"] = {
	init: function () {
		this.jsonInit({
			"type": "set_speed",
			"message0": "Geschwindigkeit %1 %2 %%",
			"args0": [
			  {
				"type": "field_dropdown",
				"name": "MOTION_TYPE",
				"options": [
					["Bewegung", "move"],
					["Greifer", "gripper"]
				]
			  },
			  {
				"type": "field_number",
				"name": "SPEED",
				"value": 50,
				"min": 1,
				"max": 100,
				"precision": 1
			  }
			],
			previousStatement: null,
			nextStatement: null,
			style: 'extras_blocks',
			"tooltip": "Ändere die Bewegungsgeschwindigkeit des Roboters.",
			"helpUrl": ""
		  });
	},
};

Blockly.Blocks["joint_lock"] = {
	init: function () {
		const sim = Simulation.instance;
		this.numJoints = sim.robot.arm.movable.length;
		let the_options = [];

		for (let i = 1; i <= this.numJoints; i++) {
			the_options.push(['j' + i, i.toString()]);
		}

		this.jsonInit({
			type: "joint_lock",
			message0: "Sperre %1",
			args0: [
				{
					"type": "field_dropdown",
					"name": "JOINT",
					"options": the_options
				}
			],
			inputsInline: false,
			previousStatement: null,
			nextStatement: null,
			style: 'extras_blocks',
			tooltip:
				"Verhindert Änderungen des Gelenkwinkels für das gewählte Gelenk",
			helpUrl: "",
		});
	},
};

Blockly.Blocks["joint_unlock"] = {
	init: function () {
		const sim = Simulation.instance;
		this.numJoints = sim.robot.arm.movable.length;
		let the_options = [];

		for (let i = 1; i <= this.numJoints; i++) {
			the_options.push(['j' + i, i.toString()]);
		}

		this.jsonInit({
			type: "joint_unlock",
			message0: "Entsperre %1",
			args0: [
				{
					"type": "field_dropdown",
					"name": "JOINT",
					"options": the_options
				}
			],
			inputsInline: false,
			previousStatement: null,
			nextStatement: null,
			style: 'extras_blocks',
			tooltip:
				"Erlaubt Änderungen des Gelenkwinkels für das gewählte Gelenk",
			helpUrl: "",
		});
	},
};

