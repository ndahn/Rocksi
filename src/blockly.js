import * as Blockly from "blockly"
import "blockly/msg/de"

var blocklyDiv = document.getElementById('blocks-canvas');
var workspace = Blockly.inject(blocklyDiv,
    { toolbox: document.getElementById('blocks-toolbox') });
