import * as Blockly from "blockly"
import "blockly/blockly_compressed"
import "blockly/javascript_compressed"
import 'blockly/msg/de'

import './blocks/move'
import './blocks/joint_space_pose'
import './blocks/task_space_pose'
import './blocks/gripper_open'
import './blocks/gripper_close'
import './blocks/joint_absolute'
import './blocks/joint_relative'

const generator = Blockly.JavaScript;
generator.STATEMENT_PREFIX = 'highlightBlock(%1);\n'
generator.addReservedWords('highlightBlock');
generator.addReservedWords('sendRobotCommand');
generator.addReservedWords('code');

var Interpreter = require('js-interpreter');

import Simulation from '../simulator/simulation'


var blocklyArea = document.querySelector('.blocks-container');
var blocklyDiv = document.getElementById('blocks-canvas');

var workspace = Blockly.inject(
    blocklyDiv,
    {
        toolbox: document.getElementById('blocks-toolbox'),
        zoom: {
            controls: true,
            wheel: false,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.1,
            pinch: true
        },
        grid: {
            spacing: 20,
            length: 3,
            colour: '#ddd',
            snap: true
        },
        trashcan: true
    });


var onresize = function(e) {
    // Compute the absolute coordinates and dimensions of blocklyArea.
    var element = blocklyArea;
    var x = 0;
    var y = 0;

    do {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent;
    } while (element);

    // Position blocklyDiv over blocklyArea.
    blocklyDiv.style.left = x + 'px';
    blocklyDiv.style.top = y + 'px';
    blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
    blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
    Blockly.svgResize(workspace);
};
    
window.addEventListener('resize', onresize, false);
onresize();
Blockly.svgResize(workspace);


// Setup the run button
const runButton = document.querySelector('.run-button');

runButton.onclick = function () {
    runButton.classList.toggle('running');

    // No need to react to the other click, execution will check the status of the
    // button frequently
    if (runButton.classList.contains('running')) {
        runProgram();
    }

    return false;
};


// Get simulation instance
var simulation = null;

Simulation.getInstance(sim => {
    // Once the simulation is available we can enable the run button
    simulation = sim;
    runButton.disabled = false;
});

function simulationAPI(interpreter, globalObject) {
    let wrapper = function (id) {
        return workspace.highlightBlock(id);
    }
    interpreter.setProperty(globalObject, 'highlightBlock',
        interpreter.createNativeFunction(wrapper));
    
    wrapper = function (command, ...args) {
        return simulation.run(step, command, ...args);
    }
    interpreter.setProperty(globalObject, 'sendRobotCommand',
        interpreter.createNativeFunction(wrapper));
}

function runProgram() {
    let code = generator.workspaceToCode(workspace);
    console.log('<executing program>\n' + code);

    const interpreter = new Interpreter(code, simulationAPI);
    generator.init(workspace);
    let blocks = workspace.getTopBlocks(true);
    step(blocks, interpreter, []);
}

function step(blocks, interpreter, code) {
    if (blocks) {
        const block = blocks.shift();
        runBlock(block, interpreter, code);
        if (!block.isRobotCommandBlock) {
            step(blocks, interpreter, code);
        }
    }
    else {
        onProgramFinished(interpreter, code);
    }
}

function runBlock(block, interpreter, code) {
    let line = generator.blockToCode(block);
    if (Array.isArray(line)) {
        line = line[0];
    }
    if (line) {
        if (block.outputConnection) {
            line = generator.scrubNakedValue(line);
            if (thgeneratoris.STATEMENT_PREFIX && !block.suppressPrefixSuffix) {
                line = generator.injectId(generator.STATEMENT_PREFIX, block) + line;
            }
            if (generator.STATEMENT_SUFFIX && !block.suppressPrefixSuffix) {
                line = line + generator.injectId(generator.STATEMENT_SUFFIX, block);
            }
        }
        code.push(line);
    }

    interpreter.appendCode(line);
    interpreter.run();
}

function onProgramFinished(interpreter, code) {
    let l = code.length;
    code = generator.finish(code);
    if (code.length > l) {
        let remainder = code.slice(code.length - l);
        interpreter.appendCode(remainder);
        interpreter.run();
    }

    runButton.classList.remove('running');
}
