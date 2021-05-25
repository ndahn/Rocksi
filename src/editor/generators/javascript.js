import * as Blockly from "blockly";


/* ========
 * MOVEMENT
 * ======== */

Blockly.JavaScript["move"] = function (block) {
	let pose = Blockly.JavaScript.valueToCode(block, 'POSE', Blockly.JavaScript.ORDER_COMMA) || 0;
	let poseType = block.getInputTargetBlock('POSE').outputConnection.getCheck()[0];

	var code = 'robot("move", "' + poseType + '", ' + pose + ');';
	return code;
};

Blockly.JavaScript["default_pose"] = function (block) {
	let ret = '[' + this.defaultPose.toString() + ']';
    return [ret, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript["joint_space_pose"] = function (block) {
	let pose = [];
    for (let i = 1; i < 8; i++) {
        pose.push(block.getFieldValue('JOINT_' + i));
    }

	let code = '[' + pose.toString() + ']';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript["task_space_pose"] = function (block) {
    let pose = [];
    for (const key of ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW']) {
        pose.push(block.getFieldValue(key));
    }

    let code = '[' + pose.toString() + ']';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript["joint_absolute"] = function (block) {
	let joint = block.getFieldValue('JOINT');
	let angle = block.getFieldValue('DEGREES');

	return code = 'robot("joint_absolute", ' + joint + ', ' + angle + ');';
};

Blockly.JavaScript["joint_relative"] = function (block) {
	let joint = block.getFieldValue('JOINT');
	let angle = block.getFieldValue('DEGREES');

	return code = 'robot("joint_relative", ' + joint + ', ' + angle + ');';
};


/* =======
 * OBJECTS
 * ======= */

Blockly.JavaScript["gripper_open"] = function (block) {
	var code = 'robot("gripper_open");';
	return code;
};

Blockly.JavaScript["gripper_close"] = function (block) {
	var code = 'robot("gripper_close");';
	return code;
};


/* ======
 * EXTRAS
 * ====== */

Blockly.JavaScript["comment"] = function (block) {
	return "// " + block.getFieldValue('COMMENT');
};

Blockly.JavaScript["wait"] = function (block) {
	let time = block.getFieldValue('SECONDS');
	return 'robot("wait", ' + (time * 1000) + ');';
};

Blockly.JavaScript["set_speed"] = function (block) {
	var motion = block.getFieldValue('MOTION_TYPE');
	var speed = block.getFieldValue('SPEED');
	
	var code = 'robot("setParam", "velocity/' + motion + '", ' + speed/100 + ');';
	return code;
};

Blockly.JavaScript["joint_lock"] = function (block) {
	let joint = block.getFieldValue('JOINT');
	return code = 'robot("lockJoint", ' + joint + ');';
};

Blockly.JavaScript["joint_unlock"] = function (block) {
	let joint = block.getFieldValue('JOINT');
	return code = 'robot("unlockJoint", ' + joint + ');';
};