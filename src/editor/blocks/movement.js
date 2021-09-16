import * as Blockly from "blockly";
import { Object3D, Euler } from "three"
import Simulation from '../../simulator/simulation'
import '../mutators/left_right_mutator'


Blockly.Blocks["move"] = {
	init: function () {
		this.jsonInit({
			type: "move",
			message0: "%{BKY_ROCKSI_BLOCK_MOVE}",
			args0: [
				{
					type: "input_value",
					name: "POSE",
                    check: ["TaskspacePose", "JointspacePose"],
				},
			],
			inputsInline: false,
			previousStatement: null,
			nextStatement: "Array",
			style: 'movement_blocks',
			tooltip: "%{BKY_ROCKSI_BLOCK_MOVE_TOOLTIP}",
			helpUrl: "",
		});
	},

	getJointspacePose: function () {
		const jpose = Simulation.instance.getJointSpacePose();
		for (let j = 0; j < jpose.length; j++) {
			jpose[j] = jpose[j] * 180.0 / Math.PI;
		}
		return jpose;
	},

	setJointspacePose: function (degrees) {
		for (let i = 0; i < degrees.length; i++) {
			degrees[i] *= Math.PI / 180.0;
		}
		Simulation.instance.robot.setPose(degrees);
		Simulation.instance.renderCallback();
	},

	getTaskspacePose: function () {
		let tpose = Simulation.instance.getTaskSpacePose();
		for (let j = 3; j < 6; j++) {
			tpose[j] = tpose[j] * 180.0 / Math.PI;
		}
		return tpose;
	},

	setTaskspacePose: function (pose) {
		const robot = Simulation.instance.robot;

		const ikTarget = new Object3D();
		ikTarget.position.set(pose[0], pose[1], pose[2]);
		if (pose.length > 3) {
			ikTarget.setRotationFromEuler(new Euler(pose[3], pose[4], pose[5]));
		} else {
			ikTarget.setRotationFromQuaternion(robot.tcp.object.quaternion);
		}

		const solution = Simulation.instance.ik.solve(
			ikTarget,
			robot,
			robot.ikEnabled,
			{
				// This should be precise to avoid surprises for the user
				maxIterations: 30,
				stopDistance: 0.05,
				jointLimits: robot.interactionJointLimits,
				apply: false
			}
		);

		this.setJointspacePose(solution);
	}
};

Blockly.Blocks["default_pose"] = {
	init: function () {
		this.jsonInit({
			type: "default_pose",
			message0: "%{BKY_ROCKSI_BLOCK_DEFAULTPOSE}",
			output: "JointspacePose",
			style: 'movement_blocks',
			tooltip: "%{BKY_ROCKSI_BLOCK_DEFAULTPOSE_TOOLTIP}",
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
			tooltip: "%{BKY_ROCKSI_BLOCK_JOINTSPACEPOSE_TOOLTIP}",
			helpUrl: "",
			mutator: 'left_right_mutator',
		});
	},

	onLeft: function(e) {
        var parent = this.getParent();
        if (parent != null && typeof parent.getJointspacePose === 'function') {
            var fieldValues = parent.getJointspacePose();
            for (var i = 0; i < fieldValues.length; i++) {
                this.setFieldValue(fieldValues[i].toFixed(0), 'JOINT_' + (i + 1));
            }
        }
	},

	onRight: function(e) {
		var parent = this.getParent();
        if (parent != null && typeof parent.setJointspacePose === 'function') {
			let pose = [];
			for (let i = 1; i <= this.numJoints; i++) {
				pose.push(this.getFieldValue('JOINT_' + i));
			}
            parent.setJointspacePose(pose);
        }
	}
};

Blockly.Blocks["task_space_pose"] = {
	init: function () {
		let i = 0;
		this.jsonInit({
			type: "pose",
			message0: "x %1 y %2 z %3 ϕ %4 θ %5 ψ %6",
			args0: [
				{
					"type": "field_number",
					"name": "X",
					"value": 0,
					"precision": 0.1,
				},
				{
					"type": "field_number",
					"name": "Y",
					"value": 0,
					"precision": 0.1,
				},
				{
					"type": "field_number",
					"name": "Z",
					"value": 0,
                    "min": 0,
					"precision": 0.1,
				},
				{
					"type": "field_angle",
					"name": "ROLL",
					"angle": 0,
                    "precision": 0.1,
				},
				{
					"type": "field_angle",
					"name": "PITCH",
					"angle": 0,
                    "precision": 0.1,
				},
				{
					"type": "field_angle",
					"name": "YAW",
					"angle": 0,
                    "precision": 0.1
				},
			],
			inputsInline: true,
			output: "TaskspacePose",
			style: 'movement_blocks',
			tooltip: "%{BKY_ROCKSI_BLOCK_TASKSPACEPOSE_TOOLTIP}",
			helpUrl: "",
			mutator: 'left_right_mutator',
		});
	},

	onLeft: function(e) {
		const fieldKeys = ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW'];
        var parent = this.getParent();
        if (parent != null && typeof parent.getTaskspacePose === 'function') {
            var fieldValues = parent.getTaskspacePose();
            for (var i = 0; i < fieldValues.length; i++) {
                let val = (i < 3) ? fieldValues[i].toFixed(1) : fieldValues[i].toFixed(0);
                this.setFieldValue(val, fieldKeys[i]);
            }
		}
	},

	onRight: function(e) {
		var parent = this.getParent();
		if (parent != null && typeof parent.setTaskspacePose === 'function') {
			let pose = [];
			for (const key of ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW']) {
				pose.push(this.getFieldValue(key));
			}
			parent.setTaskspacePose(pose);
		}
	},

    /*onchange: function(event) {
        const fieldKeys = ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW'];
        var parent = this.getParent();
        if (parent != null && parent.type == 'add_sim_object') {
            var fieldValues = parent.getTaskspacePose();
            for (var i = 0; i < fieldValues.length; i++) {
                let val = (i < 3) ? fieldValues[i].toFixed(1) : fieldValues[i].toFixed(0);
                this.setFieldValue(val, fieldKeys[i]);
            }
        }
    }*/
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
			message0: "%{BKY_ROCKSI_BLOCK_JOINTABSOLUTE}",
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
			tooltip: "%{BKY_ROCKSI_BLOCK_JOINTABSOLUTE_TOOLTIP}",
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
			message0: "%{BKY_ROCKSI_BLOCK_JOINTRELATIVE}",
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
			tooltip: "%{BKY_ROCKSI_BLOCK_JOINTRELATIVE_TOOLTIP}",
			helpUrl: "",
		});
	},
};
