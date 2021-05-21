import * as Blockly from 'blockly'
import Simulation from '../../simulator/simulation';
import * as Alert from '../../alert'


// Old version uses slightly different imports and init:
/*
	from niryo_one_python_api.niryo_one_api import *
	import rospy
	rospy.init_node('niryo_one_run_python_api_code')

	n = NiryoOne()
*/
const NiryoGenerator_v3 = new Blockly.Generator();
Object.assign(NiryoGenerator_v3, Blockly.Python);
NiryoGenerator_v3.name_ = 'Niryo';

NiryoGenerator_v3.finish_orig = NiryoGenerator_v3.finish;
NiryoGenerator_v3.finish = function (code) {
    let n = NiryoGenerator_v3;
    n.definitions_["import_niryo_roswrapper"] = "from niryo_robot_python_ros_wrapper.ros_wrapper import *";
    n.definitions_["import_sys"] = "import_sys";
    n.definitions_["import_rospy"] = "import rospy";

    n.definitions_["niryo_init"] =
          "rospy.init_node('rocksi_niryo_code')\n"
        + "n = NiryoRosWrapper()\n"
        + "n.calibrate_auto()";
	
    code =
        "try:\n" +
            n.prefixLines(code, n.INDENT) + '\n' +
        "except NiryoRosWrapperException as e:\n" +
            n.prefixLines("sys.stderr.write(str(e))", n.INDENT);
	
    return n.finish_orig(code);
};


NiryoGenerator_v3.MAX_MOVE_SPEED = 100;
NiryoGenerator_v3.MAX_GRIPPER_SPEED = 1000;
NiryoGenerator_v3.GRIPPER_SPEED = 100;

var simulation = null;
Simulation.getInstance().then(sim => simulation = sim);


/* ==============
 * BLOCKS TO CODE
 * ============== */

// Movement

NiryoGenerator_v3["move"] = function (block) {
    let pose = Blockly.JavaScript.valueToCode(block, 'POSE', Blockly.JavaScript.ORDER_COMMA) || 0;
    let poseType = block.getInputTargetBlock('POSE').outputConnection.getCheck()[0];
    
    switch (poseType) {
        case 'joint_space_pose':
            return 'n.move_joints(*' + pose + ')';
        
        case 'task_space_pose':
            return 'n.move_pose(*' + pose + ')';
        
        default:
            throw new Error('Invalid move argument \'' + poseType + '\'');
    }
};

NiryoGenerator_v3["default_pose"] = function (block) {
    let ret = '[' + block.defaultPose.toString() + ']';
    return [ret, Blockly.NiryoGenerator_v3.ORDER_COLLECTION];
};

NiryoGenerator_v3["joint_space_pose"] = function (block) {
    let pose = [];
    for (let i = 1; i < 8; i++) {
        pose.push(block.getFieldValue('JOINT_' + i));
    }

	let code = '[' + ret.toString() + ']';
    return [code, Blockly.NiryoGenerator_v3.ORDER_COLLECTION];
};

NiryoGenerator_v3["task_space_pose"] = function (block) {
    let pose = [];
    for (const key of ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW']) {
        pose.push(block.getFieldValue(key));
    }

    let code = '[' + pose.toString() + ']';
    return [code, Blockly.NiryoGenerator_v3.ORDER_COLLECTION];
};

NiryoGenerator_v3["joint_absolute"] = function (block) {
    let joint = block.getFieldValue('JOINT');
    let deg = block.getFieldValue('DEGREES');
    let rad = deg / 180 * Math.PI;

    let code =
          "pose = n.get_joints()\n"
        + "pose[" + (joint - 1) + "] = " + rad + '\n'
        + "n.move_joints(*pose)";
    
    return code;
};

NiryoGenerator_v3["joint_relative"] = function (block) {
    let joint = block.getFieldValue('JOINT');
    let deg = block.getFieldValue('DEGREES');
    let rad = deg / 180 * Math.PI;
    
    let code =
          "pose = n.get_joints()\n"
        + "pose[" + (joint - 1) + "] += " + rad + '\n'
        + "n.move_joints(*pose)";
    
    return code;
};


// Objects

NiryoGenerator_v3["gripper_open"] = function (block) {
    let code = 'n.open_gripper(' + NiryoGenerator_v3.GRIPPER_SPEED + ')';
    return code;
};

NiryoGenerator_v3["gripper_open"] = function (block) {
    let code = 'n.close_gripper(' + NiryoGenerator_v3.GRIPPER_SPEED + ')';
    return code;
};


// Logic
// Standard blocks, handled by Blockly.Python


// Extras

NiryoGenerator_v3["comment"] = function (block) {
    return "# " + block.getFieldValue('COMMENT');
};

NiryoGenerator_v3["wait"] = function (block) {
    let seconds = block.getFieldValue('SECONDS');
    return "n.wait(" + seconds + ")";
};

NiryoGenerator_v3["set_speed"] = function (block) {
	var motion = block.getFieldValue('MOTION_TYPE');
	var speed = block.getFieldValue('SPEED') / 100;
	
    switch (motion) {
        case 'move':
            // Set directly on the robot
            let v = (speed * NiryoGenerator_v3.MAX_MOVE_SPEED).toFixed(0);
            return 'set_arm_max_velocity(' + v + ')';
        
        case 'gripper':
            // Used by gripper_open/_close
            NiryoGenerator_v3.GRIPPER_SPEED = (speed * NiryoGenerator_v3.MAX_GRIPPER_SPEED).toFixed(0);
            return null;
        
        default:
            throw new Error('Unknown motion type ' + motion);
    }
};

NiryoGenerator_v3["joint_lock"] = function (block) {
    Alert.popWarning('joint_lock cannot be translated for Niryo');
    return null;
};

NiryoGenerator_v3["joint_unlock"] = function (block) {
    Alert.popWarning('joint_unlock cannot be translated for Niryo');
    return null;
};
