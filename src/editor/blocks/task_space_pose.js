import * as Blockly from "blockly"

Blockly.Blocks['task_space_pose'] = {
  init: function () {
    this.jsonInit({
      "type": "task_space_pose",
      "message0": "x %1 y %2 z %3 yaw %4 pitch %5 roll %6",
      "args0": [
        {
          "type": "field_angle",
          "name": "x",
          "angle": 0
        },
        {
          "type": "field_angle",
          "name": "y",
          "angle": 0
        },
        {
          "type": "field_angle",
          "name": "z",
          "angle": 0
        },
        {
          "type": "field_angle",
          "name": "yaw",
          "angle": 0
        },
        {
          "type": "field_angle",
          "name": "pitch",
          "angle": 0
        },
        {
          "type": "field_angle",
          "name": "roll",
          "angle": 0
        }
      ],
      "inputsInline": true,
      "output": "Array",
      "colour": 210,
      "tooltip": "Eine Pose im Arbeitsraum (definiert über die Endeffektorpose, Position und Orientierung)",
      "helpUrl": ""
    });
  }
};