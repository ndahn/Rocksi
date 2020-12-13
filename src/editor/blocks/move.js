import * as Blockly from "blockly"

Blockly.Blocks['move'] = {
  init: function () {
    this.jsonInit({
      "type": "move",
      "message0": "Bewegung %1",
      "args0": [
        {
          "type": "input_value",
          "name": "pose",
          "check": "Array"
        }
      ],
      "inputsInline": false,
      "previousStatement": null,
      "nextStatement": "Array",
      "colour": 210,
      "tooltip": "Füge rechts eine Joint oder Task Space Pose hinzu, zu der sich der Roboter bewegen soll",
      "helpUrl": ""
    });
  }
};