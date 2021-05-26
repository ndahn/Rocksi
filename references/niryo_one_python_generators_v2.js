// Color object for vision
//TODO Should be in a class
const g_color_values = {
  'COLOR_RED': "RED",
  'COLOR_GREEN': "GREEN",
  'COLOR_BLUE': "BLUE",
  'COLOR_ANY': "ANY"
}

// Shape object for vision
//TODO Should be in a class
const g_shape_values = {
  'SHAPE_SQUARE': "SQUARE",
  'SHAPE_CIRCLE': "CIRCLE",
  'SHAPE_ANY': "ANY"
}

// Movement

Blockly.Python['niryo_one_move_joints'] = function (block) {
  var number_joints_1 = block.getFieldValue('JOINTS_1');
  var number_joints_2 = block.getFieldValue('JOINTS_2');
  var number_joints_3 = block.getFieldValue('JOINTS_3');
  var number_joints_4 = block.getFieldValue('JOINTS_4');
  var number_joints_5 = block.getFieldValue('JOINTS_5');
  var number_joints_6 = block.getFieldValue('JOINTS_6');

  var code = 'n.move_joints([' + number_joints_1 + ', ' + number_joints_2 + ', '
    + number_joints_3 + ', ' + number_joints_4 + ', ' + number_joints_5 + ', ' + number_joints_6 + '])\n'
  return code;
};

Blockly.Python['niryo_one_move_pose'] = function (block) {
  var number_pose_x = block.getFieldValue('POSE_X');
  var number_pose_y = block.getFieldValue('POSE_Y');
  var number_pose_z = block.getFieldValue('POSE_Z');
  var number_pose_roll = block.getFieldValue('POSE_ROLL');
  var number_pose_pitch = block.getFieldValue('POSE_PITCH');
  var number_pose_yaw = block.getFieldValue('POSE_YAW');

  var code = 'n.move_pose(' + number_pose_x + ', ' + number_pose_y + ', ' +
    number_pose_z + ', ' + number_pose_roll + ', ' + number_pose_pitch +
    ', ' + number_pose_yaw + ")\n";
  return code;
};

Blockly.Python['niryo_one_shift_pose'] = function (block) {
  var dropdown_shift_pose_axis = block.getFieldValue('SHIFT_POSE_AXIS');
  var number_shift_pose_value = block.getFieldValue('SHIFT_POSE_VALUE');

  var code = 'n.shift_pose(' + dropdown_shift_pose_axis + ', ' +
    number_shift_pose_value + ')\n';
  return code;
};

Blockly.Python['niryo_one_set_arm_max_speed'] = function (block) {
  var value_set_arm_max_speed = Blockly.Python.valueToCode(block, 'SET_ARM_MAX_SPEED', Blockly.Python.ORDER_ATOMIC) || '0';
  var code = 'n.set_arm_max_velocity(' + value_set_arm_max_speed + ')\n';
  return code;
};

Blockly.Python['niryo_one_calibrate_auto'] = function (block) {
  var code = 'n.calibrate_auto()\n';
  return code;
};

Blockly.Python['niryo_one_calibrate_manual'] = function (block) {
  var code = 'n.calibrate_manual()\n';
  return code;
};

Blockly.Python['niryo_one_activate_learning_mode'] = function (block) {
  var dropdown_learning_mode_value = block.getFieldValue('LEARNING_MODE_VALUE');
  var code = 'n.activate_learning_mode(' + dropdown_learning_mode_value + ')\n';
  return code;
};


Blockly.Python['niryo_one_joint'] = function (block) {
  var value_j1 = Blockly.Python.valueToCode(block, 'j1', Blockly.Python.ORDER_ATOMIC).replace('(', '').replace(')', '');
  var value_j2 = Blockly.Python.valueToCode(block, 'j2', Blockly.Python.ORDER_ATOMIC).replace('(', '').replace(')', '');
  var value_j3 = Blockly.Python.valueToCode(block, 'j3', Blockly.Python.ORDER_ATOMIC).replace('(', '').replace(')', '');
  var value_j4 = Blockly.Python.valueToCode(block, 'j4', Blockly.Python.ORDER_ATOMIC).replace('(', '').replace(')', '');
  var value_j5 = Blockly.Python.valueToCode(block, 'j5', Blockly.Python.ORDER_ATOMIC).replace('(', '').replace(')', '');
  var value_j6 = Blockly.Python.valueToCode(block, 'j6', Blockly.Python.ORDER_ATOMIC).replace('(', '').replace(')', '');

  var code = "[" + value_j1 + ", " + value_j2 + ", " + value_j3 + ", " + value_j4 + ", " + value_j5 + ", " + value_j6 + "]";
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['niryo_one_move_joint_from_joint'] = function (block) {
  // Position object
  var value_joint =  Blockly.Python.valueToCode(block, 'JOINT', Blockly.Python.ORDER_ATOMIC);
  value_joint = value_joint.replace('(', '').replace(')', '');

  var code = 'n.move_joints(' + value_joint + ')\n';
  return code;
}

Blockly.Python['niryo_one_pose'] = function (block) {
  var value_x = Blockly.Python.valueToCode(block, 'x', Blockly.Python.ORDER_ATOMIC).replace('(', '').replace(')', '');
  var value_y = Blockly.Python.valueToCode(block, 'y', Blockly.Python.ORDER_ATOMIC).replace('(', '').replace(')', '');
  var value_z = Blockly.Python.valueToCode(block, 'z', Blockly.Python.ORDER_ATOMIC).replace('(', '').replace(')', '');
  var value_roll = Blockly.Python.valueToCode(block, 'roll', Blockly.Python.ORDER_ATOMIC).replace('(', '').replace(')', '');
  var value_pitch = Blockly.Python.valueToCode(block, 'pitch', Blockly.Python.ORDER_ATOMIC).replace('(', '').replace(')', '');
  var value_yaw = Blockly.Python.valueToCode(block, 'yaw', Blockly.Python.ORDER_ATOMIC).replace('(', '').replace(')', '');

  var code = "[" + value_x + ", " + value_y + ", " + value_z + ", " + value_roll + ", " + value_pitch + ", " + value_yaw + "]";
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['niryo_one_move_pose_from_pose'] = function (block) {
  // Position object
  var value_pose =  Blockly.Python.valueToCode(block, 'POSE', Blockly.Python.ORDER_ATOMIC);
  value_pose = value_pose.replace('(', '').replace(')', '');

  var code = 'n.move_pose(*' + value_pose + ')\n';
  return code;
}

Blockly.Python['niryo_one_pick_from_pose'] = function (block) {
  // Position object
  var value_pose = Blockly.Python.valueToCode(block, 'POSE', Blockly.Python.ORDER_ATOMIC);
  value_pose = value_pose.replace('(', '').replace(')', '');

  var code = 'n.pick_from_pose(' + value_pose + ')\n';
  return code;
};

Blockly.Python['niryo_one_place_from_pose'] = function (block) {
  // Position object
  var value_pose =  Blockly.Python.valueToCode(block, 'POSE', Blockly.Python.ORDER_ATOMIC);
  value_pose = value_pose.replace('(', '').replace(')', '');

  var code = 'n.place_from_pose(' + value_pose + ')\n';
  return code;
}

// I/O

Blockly.Python['niryo_one_gpio_state'] = function (block) {
  var dropdown_gpio_state_select = block.getFieldValue('GPIO_STATE_SELECT');
  var code = dropdown_gpio_state_select;
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['niryo_one_set_pin_mode'] = function (block) {
  var value_pin = Blockly.Python.valueToCode(block, 'SET_PIN_MODE_PIN', Blockly.Python.ORDER_ATOMIC) || '(0)';
  var dropdown_pin_mode_select = block.getFieldValue('PIN_MODE_SELECT');
  value_pin = value_pin.replace('(', '').replace(')', '');
  var code = 'n.pin_mode(' + value_pin + ', ' + dropdown_pin_mode_select + ')\n';
  return code;
};

Blockly.Python['niryo_one_digital_write'] = function (block) {
  var value_pin = Blockly.Python.valueToCode(block, 'DIGITAL_WRITE_PIN', Blockly.Python.ORDER_ATOMIC) || '(0)';
  var dropdown_pin_write_select = block.getFieldValue('PIN_WRITE_SELECT');
  value_pin = value_pin.replace('(', '').replace(')', '');
  var code = 'n.digital_write(' + value_pin + ', ' + dropdown_pin_write_select + ')\n';
  return code;
};

Blockly.Python['niryo_one_digital_read'] = function (block) {
  var value_pin = Blockly.Python.valueToCode(block, 'DIGITAL_READ_PIN', Blockly.Python.ORDER_ATOMIC) || '(0)';
  var code = 'n.digital_read' + value_pin;
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['niryo_one_gpio_select'] = function (block) {
  var dropdown_gpio_select = block.getFieldValue('GPIO_SELECT');
  var code = dropdown_gpio_select;
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['niryo_one_sw_select'] = function (block) {
  var dropdown_sw_select = block.getFieldValue('SW_SELECT');
  var code = dropdown_sw_select;
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['niryo_one_set_12v_switch'] = function (block) {
  var value_pin = Blockly.Python.valueToCode(block, 'SET_12V_SWITCH', Blockly.Python.ORDER_ATOMIC) || '(0)';
  var dropdown_set_12v_switch_select = block.getFieldValue('SET_12V_SWITCH_SELECT');
  value_pin = value_pin.replace('(', '').replace(')', '');
  var code = 'n.digital_write(' + value_pin + ', ' + dropdown_set_12v_switch_select + ')\n';
  return code;
};

// Tool

Blockly.Python['niryo_one_tool_select'] = function (block) {
  var dropdown_tool_select = block.getFieldValue('TOOL_SELECT');
  var code = dropdown_tool_select;
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['niryo_one_change_tool'] = function (block) {
  var value_tool_name = Blockly.Python.valueToCode(block, 'NEW_TOOL_ID', Blockly.Python.ORDER_ATOMIC) || '(TOOL_NONE)';
  var code = 'n.change_tool' + value_tool_name + '\n';
  return code;
};

Blockly.Python['niryo_one_detach_tool'] = function (block) {
  var code = 'n.change_tool(0)\n';
  return code;
};

Blockly.Python['niryo_one_open_gripper'] = function (block) {
  var value_gripper_id = Blockly.Python.valueToCode(block, 'OPEN_GRIPPER_ID', Blockly.Python.ORDER_ATOMIC) || '(TOOL_NONE)';
  value_gripper_id = value_gripper_id.replace('(', '').replace(')', '');
  var number_open_speed = block.getFieldValue('OPEN_SPEED');
  var code = 'n.open_gripper(' + value_gripper_id + ', ' + number_open_speed + ')\n';
  return code;
};

Blockly.Python['niryo_one_close_gripper'] = function (block) {
  var value_gripper_id = Blockly.Python.valueToCode(block, 'CLOSE_GRIPPER_ID', Blockly.Python.ORDER_ATOMIC) || '(TOOL_NONE)';
  value_gripper_id = value_gripper_id.replace('(', '').replace(')', '');
  var number_close_speed = block.getFieldValue('CLOSE_SPEED');
  var code = 'n.close_gripper(' + value_gripper_id + ', ' + number_close_speed + ')\n';
  return code;
};

Blockly.Python['niryo_one_pull_air_vacuum_pump'] = function (block) {
  var value_vacuum_pump_id = Blockly.Python.valueToCode(block, 'PULL_AIR_VACUUM_PUMP_ID', Blockly.Python.ORDER_ATOMIC) || '(TOOL_NONE)';
  var code = 'n.pull_air_vacuum_pump(' + value_vacuum_pump_id + ')\n';
  return code;
};

Blockly.Python['niryo_one_push_air_vacuum_pump'] = function (block) {
  var value_vacuum_pump_id = Blockly.Python.valueToCode(block, 'PUSH_AIR_VACUUM_PUMP_ID', Blockly.Python.ORDER_ATOMIC) || '(TOOL_NONE)';
  var code = 'n.push_air_vacuum_pump(' + value_vacuum_pump_id + ')\n';
  return code;
};

Blockly.Python['niryo_one_setup_electromagnet'] = function (block) {
  var value_electromagnet_id = Blockly.Python.valueToCode(block, 'SETUP_ELECTROMAGNET_ID', Blockly.Python.ORDER_ATOMIC) || '(TOOL_NONE)';
  var value_electromagnet_pin = Blockly.Python.valueToCode(block, 'SETUP_ELECTROMAGNET_PIN', Blockly.Python.ORDER_ATOMIC) || '(0)';
  value_electromagnet_id = value_electromagnet_id.replace('(', '').replace(')', '');
  value_electromagnet_pin = value_electromagnet_pin.replace('(', '').replace(')', '');
  var code = 'n.setup_electromagnet(' + value_electromagnet_id + ', ' + value_electromagnet_pin + ')\n';
  return code;
};

Blockly.Python['niryo_one_activate_electromagnet'] = function (block) {
  var value_electromagnet_id = Blockly.Python.valueToCode(block, 'ACTIVATE_ELECTROMAGNET_ID', Blockly.Python.ORDER_ATOMIC) || '(TOOL_NONE)';
  var value_electromagnet_pin = Blockly.Python.valueToCode(block, 'ACTIVATE_ELECTROMAGNET_PIN', Blockly.Python.ORDER_ATOMIC) || '(0)';
  value_electromagnet_id = value_electromagnet_id.replace('(', '').replace(')', '');
  value_electromagnet_pin = value_electromagnet_pin.replace('(', '').replace(')', '');
  var code = 'n.activate_electromagnet(' + value_electromagnet_id + ', ' + value_electromagnet_pin + ')\n';
  return code;
};

Blockly.Python['niryo_one_deactivate_electromagnet'] = function (block) {
  var value_electromagnet_id = Blockly.Python.valueToCode(block, 'DEACTIVATE_ELECTROMAGNET_ID', Blockly.Python.ORDER_ATOMIC) || '(TOOL_NONE)';
  var value_electromagnet_pin = Blockly.Python.valueToCode(block, 'DEACTIVATE_ELECTROMAGNET_PIN', Blockly.Python.ORDER_ATOMIC) || '(0)';
  value_electromagnet_id = value_electromagnet_id.replace('(', '').replace(')', '');
  value_electromagnet_pin = value_electromagnet_pin.replace('(', '').replace(')', '');
  var code = 'n.deactivate_electromagnet(' + value_electromagnet_id + ', ' + value_electromagnet_pin + ')\n';
  return code;
};

// Utility

Blockly.Python['niryo_one_sleep'] = function (block) {
  var value_sleep_time = Blockly.Python.valueToCode(block, 'SLEEP_TIME', Blockly.Python.ORDER_ATOMIC) || '0';
  var code = 'n.wait(' + value_sleep_time + ')\n';
  return code;
};

Blockly.Python['niryo_one_comment'] = function (block) {
  var text_comment_text = block.getFieldValue('COMMENT_TEXT');
  var code = ' #' + text_comment_text + '\n';
  return code;
};

Blockly.Python['niryo_one_break_point'] = function (block) {
  var code = 'n.break_point()\n';
  return code;
};

// Vision

Blockly.Python['niryo_one_vision_color'] = function (block) {
  var dropdown_color_select = block.getFieldValue('COLOR_SELECT');
  var code = dropdown_color_select;
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['niryo_one_vision_shape'] = function (block) {
  var dropdown_shape_select = block.getFieldValue('SHAPE_SELECT');
  var code = dropdown_shape_select;
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['niryo_one_vision_pick'] = function (block) {
  // Color (int) value (see g_shape_values at top of this file)                                                                                                                                             
  var value_color = Blockly.Python.valueToCode(block, 'COLOR_SWITCH', Blockly.Python.ORDER_ATOMIC) || '(0)';
  value_color = value_color.replace('(', '').replace(')', '');
  value_color = g_color_values[value_color];

  // Shape (int) value (see g_shape_values at top of this file)                                                                                                                                             
  var value_shape = Blockly.Python.valueToCode(block, 'SHAPE_SWITCH', Blockly.Python.ORDER_ATOMIC) || '(0)';
  value_shape = value_shape.replace('(', '').replace(')', '');
  value_shape = g_shape_values[value_shape];

  // Name of workspace                             
  var workspace_name = Blockly.Python.valueToCode(block, 'WORKSPACE_NAME', Blockly.Python.ORDER_ATOMIC) || '(0)';
  workspace_name = workspace_name.replace('(', '').replace(')', '');

  // Height in centimeter                                                                                                                                                                                   
  var height_offset = Blockly.Python.valueToCode(block, 'HEIGHT_OFFSET', Blockly.Python.ORDER_ATOMIC) || '(0)';
  height_offset = height_offset.replace('(', '').replace(')');

  var code = 'n.pick(' + workspace_name + ', float(' + height_offset + ')/100, "' + value_shape + '", "' + value_color + '")[0]';
  return [code, Blockly.Python.ORDER_NONE];
}

Blockly.Python['niryo_one_vision_is_object_detected'] = function (block) {
  // Color (int) value (see g_shape_values at top of this file)                                                                                                                                             
  var value_color = Blockly.Python.valueToCode(block, 'COLOR_SWITCH', Blockly.Python.ORDER_ATOMIC) || '(0)';
  value_color = value_color.replace('(', '').replace(')', '');
  value_color = g_color_values[value_color];

  // Shape (int) value (see g_shape_values at top of this file)                                                                                                                                             
  var value_shape = Blockly.Python.valueToCode(block, 'SHAPE_SWITCH', Blockly.Python.ORDER_ATOMIC) || '(0)';
  value_shape = value_shape.replace('(', '').replace(')', '');
  value_shape = g_shape_values[value_shape];

  // Name of workspace                                                                                                                                                                                      
  var workspace_name = Blockly.Python.valueToCode(block, 'WORKSPACE_NAME', Blockly.Python.ORDER_ATOMIC) || '(0)';
  workspace_name = workspace_name.replace('(', '').replace(')', '');

  var code = 'n.detect_object(n.get_workspace_ratio(' + workspace_name + '), "' + value_shape + '", "' + value_color + '")[0]';
  return [code, Blockly.Python.ORDER_NONE];
}

// Conveyor

Blockly.Python['niryo_one_conveyor_models'] = function (block) {
  const conveyor_id_map = {
    "CONVEYOR_1": 6,
    "CONVEYOR_2": 7
  };
  var conveyor_model_id = block.getFieldValue('CONVEYOR_SELECT');
  var code = conveyor_id_map[conveyor_model_id];
  return [code, Blockly.Python.ORDER_NONE];
}

Blockly.Python['niryo_one_conveyor_use'] = function (block) {
  var conveyor_id = Blockly.Python.valueToCode(block, 'CONVEYOR_SWITCH', Blockly.Python.ORDER_ATOMIC) || '(0)';
  conveyor_id = conveyor_id.replace('(', '').replace(')', '');
  var code = 'n.set_conveyor(' + conveyor_id + ', True)\n';
  return code;
}

Blockly.Python['niryo_one_conveyor_control'] = function (block) {
  var conveyor_id = Blockly.Python.valueToCode(block, 'CONVEYOR_SWITCH', Blockly.Python.ORDER_ATOMIC) || '(0)';
  conveyor_id = conveyor_id.replace('(', '').replace(')', '');
  var speed_percent = Blockly.Python.valueToCode(block, 'SPEED_PERCENT', Blockly.Python.ORDER_ATOMIC) || '(0)';
  var direction = block.getFieldValue('DIRECTION_SELECT');
  var code = 'n.control_conveyor(' + conveyor_id + ', True, ' + speed_percent + ', ' + direction + ')\n';
  return code;
}

Blockly.Python['niryo_one_conveyor_stop'] = function (block) {
  var conveyor_id = Blockly.Python.valueToCode(block, 'CONVEYOR_SWITCH', Blockly.Python.ORDER_ATOMIC) || '(0)';
  conveyor_id = conveyor_id.replace('(', '').replace(')', '');
  var code = 'n.control_conveyor(' + conveyor_id + ', False, 0, 1)\n';
  return code;
}
