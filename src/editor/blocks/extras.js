import * as Blockly from "blockly";
import Simulation from "../../simulator/simulation";


Blockly.Blocks["comment"] = {
	init: function () {
		this.jsonInit({
			type: "comment",
			message0: "%{BKY_ROCKSI_BLOCK_COMMENT}",
			args0: [
				{
					type: "field_input",
					name: "COMMENT",
					text: ""
				}
			],
			previousStatement: null,
			nextStatement: null,
			style: 'structure_blocks',
			tooltip: "%{BKY_ROCKSI_BLOCK_COMMENT_TOOLTIP}",
			helpUrl: "",
		});
	},
};

Blockly.Blocks["wait"] = {
	init: function () {
		this.jsonInit({
			type: "wait",
			message0: "%{BKY_ROCKSI_BLOCK_WAIT}",
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
			tooltip: "%{BKY_ROCKSI_BLOCK_WAIT_TOOLTIP}",
			helpUrl: "",
		});
	},
};

Blockly.Blocks["set_speed"] = {
	init: function () {
		this.jsonInit({
			"type": "set_speed",
			"message0": "%{BKY_ROCKSI_BLOCK_SETSPEED}",
			"args0": [
			  {
				"type": "field_dropdown",
				"name": "MOTION_TYPE",
				"options": [
					["%{BKY_ROCKSI_BLOCK_SETSPEED_MOVE}", "move"],
					["%{BKY_ROCKSI_BLOCK_SETSPEED_GRIPPER}", "gripper"]
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
			"tooltip": "%{BKY_ROCKSI_BLOCK_SETSPEED_TOOLTIP}",
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
			message0: "%{BKY_ROCKSI_BLOCK_JOINTLOCK}",
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
			tooltip: "%{BKY_ROCKSI_BLOCK_JOINTLOCK_TOOLTIP}",
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
			message0: "%{BKY_ROCKSI_BLOCK_JOINTUNLOCK}",
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
			tooltip: "%{BKY_ROCKSI_BLOCK_JOINTUNLOCK_TOOLTIP}",
			helpUrl: "",
		});
	},
};

