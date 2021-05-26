// This generator is used by Blockly https://developers.google.com/blockly
// Find ORDERS at https://searchcode.com/codesearch/view/98685652/

function generateCode(func_name, paramsArray, unpack=false, command_end='\n'){
  let command = 'n.' + func_name + '('
  if (unpack){
    command += '*'
  }
  const arrayLength = paramsArray.length;
  for (let i = 0; i < arrayLength; i++) {
    if (i>0){
      command += ', '
    }
    command += paramsArray[i]
  }
  command += ')'

  return command + command_end
}

// Arm

Blockly.Python['niryo_one_set_arm_max_speed'] = function (block) {
  let value_set_arm_max_speed = Blockly.Python.valueToCode(block, 'SET_ARM_MAX_SPEED');
  return generateCode('set_arm_max_velocity',[value_set_arm_max_speed]);
};

Blockly.Python['PinSniryo_one_set_learning_mode'] = function (block) {
  let dropdown_learning_mode_value = block.getFieldValue('LEARNING_MODE_VALUE');
  return generateCode('set_learning_mode',[dropdown_learning_mode_value]);
};

// Movement

Blockly.Python['niryo_one_joints'] = function (block) {
  let value_j1 = Blockly.Python.valueToCode(block, 'j1', Blockly.Python.ORDER_MEMBER)
  let value_j2 = Blockly.Python.valueToCode(block, 'j2', Blockly.Python.ORDER_MEMBER)
  let value_j3 = Blockly.Python.valueToCode(block, 'j3', Blockly.Python.ORDER_MEMBER)
  let value_j4 = Blockly.Python.valueToCode(block, 'j4', Blockly.Python.ORDER_MEMBER)
  let value_j5 = Blockly.Python.valueToCode(block, 'j5', Blockly.Python.ORDER_MEMBER)
  let value_j6 = Blockly.Python.valueToCode(block, 'j6', Blockly.Python.ORDER_MEMBER)

  let code = "[" + value_j1 + ", " + value_j2 + ", " + value_j3 + ", " + value_j4 + ", " + value_j5 + ", " + value_j6 + "]";
  return [code, Blockly.Python.ORDER_COLLECTION];
};

Blockly.Python['niryo_one_move_joints_from_joints'] = function (block) {
  let value_joints =  Blockly.Python.valueToCode(block, 'JOINTS', Blockly.Python.ORDER_MEMBER);

  return generateCode("move_joints",[value_joints], true);
}

Blockly.Python['niryo_one_pose'] = function (block) {
  let value_x = Blockly.Python.valueToCode(block, 'x')
  let value_y = Blockly.Python.valueToCode(block, 'y')
  let value_z = Blockly.Python.valueToCode(block, 'z')
  let value_roll = Blockly.Python.valueToCode(block, 'roll')
  let value_pitch = Blockly.Python.valueToCode(block, 'pitch')
  let value_yaw = Blockly.Python.valueToCode(block, 'yaw')

  let code = "[" + value_x + ", " + value_y + ", " + value_z + ", " + value_roll + ", " + value_pitch + ", " + value_yaw + "]";
  return [code, Blockly.Python.ORDER_COLLECTION];
};

Blockly.Python['niryo_one_move_pose_from_pose'] = function (block) {
  // Position object
  let value_pose =  Blockly.Python.valueToCode(block, 'POSE', Blockly.Python.ORDER_MEMBER);

  return generateCode("move_pose",[value_pose], true);
}

Blockly.Python['niryo_one_pick_from_pose'] = function (block) {
  // Position object
  let value_pose = Blockly.Python.valueToCode(block, 'POSE', Blockly.Python.ORDER_MEMBER);

  return generateCode("pick_from_pose",[value_pose], true);
};

Blockly.Python['niryo_one_place_from_pose'] = function (block) {
  // Position object
  let value_pose =  Blockly.Python.valueToCode(block, 'POSE', Blockly.Python.ORDER_MEMBER);

  return generateCode("place_from_pose",[value_pose], true);
}

Blockly.Python['niryo_one_shift_pose'] = function (block) {
  let dropdown_shift_pose_axis = block.getFieldValue('SHIFT_POSE_AXIS');
  let number_shift_pose_value = Blockly.Python.valueToCode(block, 'SHIFT_POSE_VALUE')

  return generateCode("shift_pose",[dropdown_shift_pose_axis, number_shift_pose_value]);
};

// I/O

Blockly.Python['niryo_one_gpio_state'] = function (block) {
  let dropdown_gpio_state_select = block.getFieldValue('GPIO_STATE_SELECT');
  return [dropdown_gpio_state_select, Blockly.Python.ORDER_COLLECTION];
};

Blockly.Python['niryo_one_gpio_select'] = function (block) {
  let dropdown_gpio_select = block.getFieldValue('GPIO_SELECT');
  return [dropdown_gpio_select, Blockly.Python.ORDER_COLLECTION];
};

Blockly.Python['niryo_one_sw_select'] = function (block) {
  let dropdown_sw_select = block.getFieldValue('SW_SELECT');
  return [dropdown_sw_select, Blockly.Python.ORDER_COLLECTION];
};


Blockly.Python['niryo_one_set_pin_mode'] = function (block) {
  let value_pin = Blockly.Python.valueToCode(block, 'SET_PIN_MODE_PIN', Blockly.Python.ORDER_MEMBER);
  let dropdown_pin_mode_select = block.getFieldValue('PIN_MODE_SELECT');

  return generateCode("set_pin_mode",[value_pin, dropdown_pin_mode_select]);
};

Blockly.Python['niryo_one_digital_write'] = function (block) {
  let value_pin = Blockly.Python.valueToCode(block, 'DIGITAL_WRITE_PIN', Blockly.Python.ORDER_MEMBER);
  let dropdown_pin_write_select = block.getFieldValue('PIN_WRITE_SELECT');

  return generateCode("digital_write",[value_pin, dropdown_pin_write_select]);
};

Blockly.Python['niryo_one_digital_read'] = function (block) {
  let value_pin = Blockly.Python.valueToCode(block, 'DIGITAL_READ_PIN', Blockly.Python.ORDER_MEMBER);

  let code = generateCode("digital_read",[value_pin],false,'');
  return [code, Blockly.Python.ORDER_ATOMIC];

};


Blockly.Python['niryo_one_set_12v_switch'] = function (block) {
  let value_pin = Blockly.Python.valueToCode(block, 'SET_12V_SWITCH', Blockly.Python.ORDER_MEMBER);
  let dropdown_set_12v_switch_select = block.getFieldValue('SET_12V_SWITCH_SELECT');

  return generateCode("digital_write",[value_pin, dropdown_set_12v_switch_select]);
};

// Tool

Blockly.Python['niryo_one_update_tool'] = function (_block) {
  return generateCode("update_tool",[]);
};

Blockly.Python['niryo_one_grasp_w_tool'] = function (_block) {

  return generateCode("grasp_with_tool",[]);
};

Blockly.Python['niryo_one_release_w_tool'] = function (_block) {

  return generateCode("release_with_tool",[]);
};

Blockly.Python['niryo_one_open_gripper'] = function (block) {
  let number_open_speed = block.getFieldValue('OPEN_SPEED');

  return generateCode("open_gripper",[number_open_speed]);
};

Blockly.Python['niryo_one_close_gripper'] = function (block) {
  let number_close_speed = block.getFieldValue('CLOSE_SPEED');

  return generateCode("close_gripper",[number_close_speed]);
};

Blockly.Python['niryo_one_pull_air_vacuum_pump'] = function (_block) {

  return generateCode("pull_air_vacuum_pump",[]);
};

Blockly.Python['niryo_one_push_air_vacuum_pump'] = function (_block) {

  return generateCode("push_air_vacuum_pump",[]);
};

Blockly.Python['niryo_one_setup_electromagnet'] = function (block) {
  let value_electromagnet_pin = Blockly.Python.valueToCode(block, 'SETUP_ELECTROMAGNET_PIN', Blockly.Python.ORDER_MEMBER);

  return generateCode("setup_electromagnet",[value_electromagnet_pin]);
};

Blockly.Python['niryo_one_activate_electromagnet'] = function (block) {
  let value_electromagnet_pin = Blockly.Python.valueToCode(block, 'ACTIVATE_ELECTROMAGNET_PIN', Blockly.Python.ORDER_MEMBER);

  return generateCode("activate_electromagnet",[value_electromagnet_pin]);
};

Blockly.Python['niryo_one_deactivate_electromagnet'] = function (block) {
  let value_electromagnet_pin = Blockly.Python.valueToCode(block, 'DEACTIVATE_ELECTROMAGNET_PIN', Blockly.Python.ORDER_MEMBER);

  return generateCode("deactivate_electromagnet",[value_electromagnet_pin]);
};

// Utility

Blockly.Python['niryo_one_sleep'] = function (block) {
  let value_sleep_time = Blockly.Python.valueToCode(block, 'SLEEP_TIME') ;

  return generateCode("wait",[value_sleep_time]);
};

Blockly.Python['niryo_one_comment'] = function (block) {
  let text_comment_text = block.getFieldValue('COMMENT_TEXT');

  return '# ' + text_comment_text + '\n';
};

Blockly.Python['niryo_one_break_point'] = function (_block) {
  return generateCode("break_point",[]);
};

// Vision

Blockly.Python['niryo_one_vision_color'] = function (block) {
  let dropdown_color_select = block.getFieldValue('COLOR_SELECT');
  return [dropdown_color_select, Blockly.Python.ORDER_COLLECTION];
};

Blockly.Python['niryo_one_vision_shape'] = function (block) {
  let dropdown_shape_select = block.getFieldValue('SHAPE_SELECT');
  return [dropdown_shape_select, Blockly.Python.ORDER_COLLECTION];

};

Blockly.Python['niryo_one_vision_pick'] = function (block) {
  // Color (int) value (see g_shape_values at top of this file)
  let value_color = Blockly.Python.valueToCode(block, 'COLOR_SWITCH', Blockly.Python.ORDER_MEMBER);

  // Shape (int) value (see g_shape_values at top of this file)
  let value_shape = Blockly.Python.valueToCode(block, 'SHAPE_SWITCH', Blockly.Python.ORDER_MEMBER);

  // Name of workspace
  let workspace_name = Blockly.Python.valueToCode(block, 'WORKSPACE_NAME', Blockly.Python.ORDER_MEMBER);

  // Height in Millimeter
  let height_offset = Blockly.Python.valueToCode(block, 'HEIGHT_OFFSET', Blockly.Python.ORDER_MEMBER);

  let code = generateCode("vision_pick",[workspace_name, height_offset + '/1000.0', value_shape, value_color],false, '[0]');
  return [code, Blockly.Python.ORDER_ATOMIC];
}

Blockly.Python['niryo_one_vision_pick_w_pose'] = function (block) {
  // Color (int) value (see g_shape_values at top of this file)
  let value_color = Blockly.Python.valueToCode(block, 'COLOR_SWITCH', Blockly.Python.ORDER_MEMBER);

  // Shape (int) value (see g_shape_values at top of this file)
  let value_shape = Blockly.Python.valueToCode(block, 'SHAPE_SWITCH', Blockly.Python.ORDER_MEMBER);

  // Observation Pose
  let value_pose =  Blockly.Python.valueToCode(block, 'OBSERVATION_POSE', Blockly.Python.ORDER_MEMBER);

  // Name of workspace
  let workspace_name = Blockly.Python.valueToCode(block, 'WORKSPACE_NAME', Blockly.Python.ORDER_MEMBER);

  // Height in centimeter
  let height_offset = Blockly.Python.valueToCode(block, 'HEIGHT_OFFSET', Blockly.Python.ORDER_MEMBER);

  let code = generateCode("vision_pick_w_obs_pose",
      [workspace_name, height_offset + '/1000.0', value_shape, value_color, value_pose], false, '[0]');
  return [code, Blockly.Python.ORDER_ATOMIC];
}

Blockly.Python['niryo_one_vision_is_object_detected'] = function (block) {
  // Color (int) value (see g_shape_values at top of this file)
  let value_color = Blockly.Python.valueToCode(block, 'COLOR_SWITCH', Blockly.Python.ORDER_MEMBER);

  // Shape (int) value (see g_shape_values at top of this file)
  let value_shape = Blockly.Python.valueToCode(block, 'SHAPE_SWITCH', Blockly.Python.ORDER_MEMBER);

  // Name of workspace
  let workspace_name = Blockly.Python.valueToCode(block, 'WORKSPACE_NAME', Blockly.Python.ORDER_MEMBER);

  let code = generateCode("detect_object",[workspace_name, value_shape, value_color], false, '[0]');
  return [code, Blockly.Python.ORDER_ATOMIC];

}

// Conveyor

Blockly.Python['niryo_one_conveyor_models'] = function (block) {
  let conveyor_model_id = block.getFieldValue('CONVEYOR_SELECT');
  return [conveyor_model_id, Blockly.Python.ORDER_COLLECTION];
}

Blockly.Python['niryo_one_conveyor_use'] = function (_block) {
  return generateCode("set_conveyor",[]);
}

Blockly.Python['niryo_one_conveyor_control'] = function (block) {
  let conveyor_id = Blockly.Python.valueToCode(block, 'CONVEYOR_SWITCH', Blockly.Python.ORDER_MEMBER);
  let speed_percent = Blockly.Python.valueToCode(block, 'SPEED_PERCENT', Blockly.Python.ORDER_MEMBER);
  let direction = block.getFieldValue('DIRECTION_SELECT');

  return generateCode("control_conveyor",[conveyor_id, 'True', speed_percent, direction]);
}

Blockly.Python['niryo_one_conveyor_stop'] = function (block) {
  let conveyor_id = Blockly.Python.valueToCode(block, 'CONVEYOR_SWITCH', Blockly.Python.ORDER_MEMBER);

  return generateCode("control_conveyor",[conveyor_id, 'False', 0, 1]);
}
