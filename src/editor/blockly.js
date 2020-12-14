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

import { Interpreter } from 'js-interpreter'

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
const runButtonIcon = runButton.querySelector('i:first-child');

runButton.onclick = function () {
    // No need to react to the other click, execution will check the status of the 
    // button frequently
    if (!runButton.classList.contains('running')) {
        runProgram();
    }

    runButton.classList.toggle('running');
    runButtonIcon.classList.toggle('fa-play');
    runButtonIcon.classList.toggle('fa-stop');
    return false;
};


// Get simulation instance
var simulation = null;

Simulation.getInstance(sim => {
    // Once the simulation is available we can enable the run button
    simulation = sim;
    runButton.disabled = false;
});

function simAPI(interpreter, globalObject) {
    let wrapper = function (id) {
        return workspace.highlightBlock(id);
    }
    interpreter.setProperty(globalObject, 'highlightBlock',
        interpreter.createNativeFunction(wrapper));
    
    const sim = simulation;
    wrapper = function (command, ...args) {
        return sim.run(command, args);
    }
    interpreter.setProperty(globalObject, 'simulation',
        interpreter.createNativeFunction(wrapper));
}

function runProgram() {
    Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n'
    Blockly.JavaScript.addReservedWords('highlightBlock');
    Blockly.JavaScript.addReservedWords('code');

    let code = Blockly.JavaScript.workspaceToCode(workspace);
    console.log('Executing program: ' + code);

    const interpreter = new Interpreter(code, simAPI);

    // save current robot state
    // execute code on instance
    // restore robot state on stop or when code fails

    function step() {
        // Step through the program for as long as the button is in running state 
        // and there is something to execute
        if (runButton.classList.contains('running') && interpreter.step()) {
            setTimeout(step, 0);
        }
        else {
            runButton.classList.remove('running');
            simulation.stop();
        }
    }
    step();
}
