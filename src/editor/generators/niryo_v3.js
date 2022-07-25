import 'blockly/python'
import * as Blockly from 'blockly'
import Simulation from '../../simulator/simulation';
import * as Alert from '../../alert'


// Version 2 uses slightly different imports and init. Also some commands 
// are named differently.
/*
	from niryo_one_python_api.niryo_one_api import *
	import rospy
	rospy.init_node('niryo_one_run_python_api_code')

	n = NiryoOne()
*/
const NiryoGenerator_v3 = Blockly.Python;
export default NiryoGenerator_v3;

NiryoGenerator_v3.finish_orig = NiryoGenerator_v3.finish;
NiryoGenerator_v3.finish = function (code) {
    const n = NiryoGenerator_v3;
    n.definitions_["import_niryo_roswrapper"] = "from niryo_robot_python_ros_wrapper.ros_wrapper import *";
    n.definitions_["import_sys"] = "import sys";
    n.definitions_["import_rospy"] = "import rospy";

    n.definitions_["niryo_init"] =
          "rospy.init_node('rocksi_niryo_code')\n"
        + "n = NiryoRosWrapper()\n"
        + "n.calibrate_auto()\n";
	
    code =
        "try:\n" +
            n.prefixLines(code, n.INDENT) + '\n' +
        "except NiryoRosWrapperException as e:\n" +
            n.prefixLines("sys.stderr.write(str(e))", n.INDENT);
	
    return n.finish_orig(code);
};


NiryoGenerator_v3.FILE_EXTENSION = '.py';
NiryoGenerator_v3.MAX_MOVE_SPEED = 100;
NiryoGenerator_v3.MAX_GRIPPER_SPEED = 1000;
NiryoGenerator_v3.GRIPPER_SPEED = 100;

var simulation = null;
Simulation.getInstance().then(sim => simulation = sim);


function export_impossible(block_name) {
    let msg = block_name + ' cannot be translated for Niryo. So sorry ._.\n'
    Alert.popWarning(msg);
    return "# " + msg;
}


/* ==============
 * BLOCKS TO CODE
 * ============== */

// Movement

NiryoGenerator_v3["move"] = function (block) {
    let pose = Blockly.JavaScript.valueToCode(block, 'POSE', Blockly.JavaScript.ORDER_COMMA) || 0;
    let poseType = block.getInputTargetBlock('POSE').outputConnection.getCheck()[0];
    
    switch (poseType) {
        case 'JointspacePose':
            return 'n.move_joints(*' + pose + ')\n';
        
        case 'TaskspacePose':
            return 'n.move_pose(*' + pose + ')\n';
        
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
        + "n.move_joints(*pose)\n";
    
    return code;
};

NiryoGenerator_v3["joint_relative"] = function (block) {
    let joint = block.getFieldValue('JOINT');
    let deg = block.getFieldValue('DEGREES');
    let rad = deg / 180 * Math.PI;
    
    let code =
          "pose = n.get_joints()\n"
        + "pose[" + (joint - 1) + "] += " + rad + '\n'
        + "n.move_joints(*pose)\n";
    
    return code;
};


// Objects

NiryoGenerator_v3["gripper_open"] = function (block) {
    let code = 'n.open_gripper(' + NiryoGenerator_v3.GRIPPER_SPEED + ')\n';
    return code;
};

NiryoGenerator_v3["gripper_close"] = function (block) {
    let code = 'n.close_gripper(' + NiryoGenerator_v3.GRIPPER_SPEED + ')\n';
    return code;
};


NiryoGenerator_v3["add_sim_object"] = function (block) {
    return export_impossible("add_sim_object");
};

NiryoGenerator_v3["physics_done"] = function (block) {
    return export_impossible("physics_done");
};

NiryoGenerator_v3["is_attached"] = function (block) {
    return export_impossible("is_attached");
};

// Logic
// Standard blocks, handled by Blockly.Python


// Extras

NiryoGenerator_v3["comment"] = function (block) {
    return "# " + block.getFieldValue('COMMENT') + '\n';
};

NiryoGenerator_v3["wait"] = function (block) {
    let seconds = block.getFieldValue('SECONDS');
    return "n.wait(" + seconds + ")\n";
};

NiryoGenerator_v3["set_speed"] = function (block) {
	let motion = block.getFieldValue('MOTION_TYPE');
	let speed = block.getFieldValue('SPEED') / 100;
	
    switch (motion) {
        case 'move':
            // Set directly on the robot
            let v = (speed * NiryoGenerator_v3.MAX_MOVE_SPEED).toFixed(0);
            return 'n.set_arm_max_velocity(' + v + ')\n';
        
        case 'gripper':
            // Used by gripper_open/_close
            NiryoGenerator_v3.GRIPPER_SPEED = (speed * NiryoGenerator_v3.MAX_GRIPPER_SPEED).toFixed(0);
            return '# set_speed(gripper) will take effect on the next gripper movement';
        
        default:
            return export_impossible("set_speed(" + motion + ")");
    }
};

NiryoGenerator_v3["joint_lock"] = function (block) {
    return export_impossible("joint_lock");
};

NiryoGenerator_v3["joint_unlock"] = function (block) {
    return export_impossible("joint_unlock");
};
