import * as Blockly from "blockly";
import Simulation from '../../simulator/simulation'
import ClickableTargetMutator from '../mutators/clickable_target_mutator'


Blockly.Blocks["move"] = {
	init: function () {
		this.jsonInit({
			type: "move",
			message0: "Bewegung %1",
			args0: [
				{
					type: "input_value",
					name: "POSE",
					check: ["JointspacePose", "TaskspacePose"],
				},
			],
			inputsInline: false,
			previousStatement: null,
			nextStatement: null,
			style: 'movement_blocks',
			tooltip:
				"Füge rechts eine Joint oder Task Space Pose hinzu, zu der sich der Roboter bewegen soll",
			helpUrl: "",
		});
	},
};

Blockly.Blocks["default_pose"] = {
	init: function () {
		this.jsonInit({
			type: "default_pose",
			message0: "Startpose",
			output: "JointspacePose",
			style: 'movement_blocks',
			tooltip:
				"Die Standard-Pose des Roboters",
			helpUrl: "",
		});

		const sim = Simulation.instance;
		const pose = [];
		const robot = sim.robot;
		const defaults = robot.defaultPose;

		for (const joint of robot.arm.movable) {
			let angle = defaults[joint.name] || 0.0
			angle *= 180 / Math.PI;
			pose.push(angle);
		}
		
		let tooltip = '';
		for (let i = 0; i < pose.length; i++) {
			tooltip += 'j' + (i + 1) + ': ' + pose[i].toFixed(0) + '°\n';
		}
		this.setTooltip(tooltip);

		this.defaultPose = pose;
	},
};

Blockly.Blocks["joint_space_pose"] = {
	init: function () {
		const sim = Simulation.instance;
		this.numJoints = sim.robot.arm.movable.length;
		
		let the_message = '';
		let the_args = [];
		// 1-based
		for (let i = 1; i <= this.numJoints; i++) {
			the_message += 'j' + i + ' %' + i;
			the_args.push({
				type: "field_angle",
				name: "JOINT_" + i,
				angle: 0
			});
		}
		
		this.jsonInit({
			type: "joint_space_pose",
			message0: the_message,
			args0: the_args,
			inputsInline: true,
			output: "JointspacePose",
			style: 'movement_blocks',
			tooltip:
				"Eine Pose im Gelenkwinkelraum (ein Winkel pro Gelenk, d.h. von der Basis zum Endeffektor)",
			helpUrl: "",
		});
		this.setMutator(new ClickableTargetMutator());
	},
	
	onClick: function (e) {
		Simulation.getInstance().then(sim => {
			const pose = sim.getJointSpacePose();
			for (let j = 0; j < pose.length; j++) {
				let deg = pose[j] * 180.0 / Math.PI;
				this.setFieldValue(deg.toFixed(0), 'JOINT_' + (j + 1));
			}
		});
	},
};

Blockly.Blocks["task_space_pose"] = {
	init: function () {
		let i = 0;
		this.jsonInit({
			type: "task_space_pose",
			message0: "x %1 y %2 z %3 r %4 p %5 y %6",
			args0: [
				{
					"type": "field_number",
					"name": "X",
					"value": 0,
					"precision": 0.1
				},
				{
					"type": "field_number",
					"name": "Y",
					"value": 0,
					"precision": 0.1
				},
				{
					"type": "field_number",
					"name": "Z",
					"value": 0,
					"precision": 0.1
				},
				{
					type: "field_angle",
					name: "ROLL",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "PITCH",
					angle: 0,
				},
				{
					type: "field_angle",
					name: "YAW",
					angle: 0,
				},
			],
			inputsInline: true,
			output: "TaskspacePose",
			style: 'movement_blocks',
			tooltip:
				"Eine Pose im Arbeitsraum (definiert über die Endeffektorpose, d.h. Position und Orientierung)",
			helpUrl: "",
		});
		this.setMutator(new ClickableTargetMutator());
	},

	onClick: function (e) {
		Simulation.getInstance(sim => {
			const pose = sim.getTaskSpacePose();
			const keys = ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW'];
			for (let j = 0; j < 3; j++) {
				this.setFieldValue(pose[j].toFixed(1), keys[j]);
			}
			for (let j = 3; j < 6; j++) {
				let deg = pose[j] * 180.0 / Math.PI;
				this.setFieldValue(deg.toFixed(0), keys[j]);
			}
		});
	},
};

Blockly.Blocks["joint_absolute"] = {
	init: function () {
		const sim = Simulation.instance;
		this.numJoints = sim.robot.arm.movable.length;
		let the_options = [];

		for (let i = 1; i <= this.numJoints; i++) {
			the_options.push(['j' + i, i.toString()]);
		}

		this.jsonInit({
			type: "joint_absolute",
			message0: "Gelenkwinkel (absolut) %1 %2",
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
			style: 'movement_blocks',
			tooltip:
				"Bewege ein einzelnes Gelenk in eine bestimmte Position",
			helpUrl: "",
		});
	},
};

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
