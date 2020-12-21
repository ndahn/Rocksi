import * as Blockly from "blockly"
import "blockly/blockly_compressed"
import "blockly/javascript_compressed"
import 'blockly/msg/de'

import './blocks/move'
import './blocks/joint_space_pose'
import './blocks/task_space_pose'
import './blocks/default_pose'
import './blocks/gripper_open'
import './blocks/gripper_close'
import './blocks/joint_absolute'
import './blocks/joint_relative'
import './blocks/set_speed'
import './blocks/joint_lock'
import './blocks/joint_unlock'

import './msg'
import './colors'


Blockly.FieldAngle.WRAP = 180;

const generator = Blockly.JavaScript;
generator.STATEMENT_PREFIX = 'highlightBlock(%1);\n'
generator.addReservedWords('highlightBlock');
generator.addReservedWords('sendRobotCommand');
generator.addReservedWords('code');

var Interpreter = require('js-interpreter');

var ResizeSensor = require('css-element-queries/src/ResizeSensor');

import Simulation from '../simulator/simulation'


var blocklyArea = document.querySelector('.blocks-container');
var blocklyDiv = document.getElementById('blocks-canvas');

var workspace = Blockly.inject(
    blocklyDiv,
    {
        toolbox: document.getElementById('blocks-toolbox'),
        renderer: 'geras',
        grid: {
            spacing: 20,
            length: 3,
            colour: '#ddd',
            snap: true
        },
        move: {
            drag: true,
            scrollbars: true
        },
        zoom: {
            controls: true,
            wheel: false,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.1,
            pinch: true
        },
    });

// Will be used for updating the joint/task state block
//var toolbox = workspace.getToolbox();

var onresize = function() {
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

new ResizeSensor(blocklyArea, onresize);
blocklyArea.addEventListener('resize', onresize, false);
onresize();
Blockly.svgResize(workspace);


var contextSaveWorkspace = {
    displayText: function () {
        return Blockly.Msg['SAVE'] || 'Save workspace';
    },

    preconditionFn: function (scope) {
        if (scope.workspace.getTopBlocks(false).length > 0) {
            return 'enabled';
        }
        return 'disabled';
    },

    callback: function (scope) {
        let xml = Blockly.Xml.workspaceToDom(scope.workspace);
        let text = Blockly.Xml.domToText(xml);
        
        let download = document.createElement('a');
        download.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        download.setAttribute('download', 'workspace.xml');
        download.style.display = 'none';

        document.body.appendChild(download);
        download.click();
        document.body.removeChild(download);
    },

    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'saveWorkspace',
    weight: 99,
};

var contextLoadWorkspace = {
    displayText: function () {
        return Blockly.Msg['LOAD'] || 'Load workspace';
    },

    preconditionFn: function (scope) {
        return 'enabled';
    },

    callback: function (scope) {
        let upload = document.createElement('input');
        upload.setAttribute('type', 'file');
        upload.style.display = 'none';
        
        upload.onchange = (fileSelectedEvent) => {
            try {
                let file = fileSelectedEvent.target.files[0];
                
                let reader = new FileReader();
                reader.readAsText(file, 'UTF-8');
                reader.onload = (readerEvent) => {
                    let text = readerEvent.target.result;
                    let xml = Blockly.Xml.textToDom(text);
                    //workspace.clear();
                    Blockly.Xml.domToWorkspace(scope.workspace, xml);
                }
            } catch (e) {
                console.log(e);
            }
        }

        document.body.appendChild(upload);
        upload.click();
        document.body.removeChild(upload);
    },

    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'loadWorkspace',
    weight: 99,
};

Blockly.ContextMenuRegistry.registry.register(contextLoadWorkspace);
Blockly.ContextMenuRegistry.registry.register(contextSaveWorkspace);



// Setup the run button
const runButton = document.querySelector('.run-button');

runButton.onclick = function () {
    runButton.classList.toggle('running');
    if (runButton.classList.contains('running')) {
        runProgram();
    }
    else {
        simulation.cancel();
        if (executionContext.interpreter) {
            executionContext.interpreter.paused_ = true;
        }
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
        return simulation.run(command, ...args);
    }
    interpreter.setProperty(globalObject, 'simulate',
        interpreter.createNativeFunction(wrapper));
    
    wrapper = function(command, ...args) {
        return simulation.runAsync(step, command, ...args);
    }
    interpreter.setProperty(globalObject, 'simulateAsync',
        interpreter.createNativeFunction(wrapper));
}


class ExecutionContext {
    constructor(blocks, interpreter) {
        this.blocks = blocks
        this.pos = 0
        this.interpreter = interpreter
        this.code = []

        return this
    }

    nextBlock() {
        return this.finished() ? null : this.blocks[this.pos++];
    }

    finished() {
        return this.pos >= this.blocks.length;
    }
}

var executionContext = null;

function runProgram() {
    simulation.reset();

    const interpreter = new Interpreter('', simulationAPI);
    let blocks = workspace.getAllBlocks(true);
    executionContext = new ExecutionContext(blocks, interpreter);
    
    generator.init(workspace);
    step();
}

function step() {
    let block = executionContext.nextBlock();
    if (block) {
        runBlock(block);
        // Our robot command blocks will use a callback to continue execution
        if (!block.deferredStep) {
            step();
        }
    }
    else {
        onProgramFinished();
    }
}

function runBlock(block) {
    // Copied from blockly/core/generator.js
    let line = generator.blockToCode(block, true);
    if (Array.isArray(line)) {
        line = line[0];
    }
    if (line) {
        if (block.outputConnection) {
            line = generator.scrubNakedValue(line);
            if (generator.STATEMENT_PREFIX && !block.suppressPrefixSuffix) {
                line = generator.injectId(generator.STATEMENT_PREFIX, block) + line;
            }
            if (generator.STATEMENT_SUFFIX && !block.suppressPrefixSuffix) {
                line = line + generator.injectId(generator.STATEMENT_SUFFIX, block);
            }
        }
        executionContext.code.push(line);
    }

    // Execute just the block
    console.log(line);
    executionContext.interpreter.appendCode(line);
    executionContext.interpreter.run();
}

function onProgramFinished() {
    // The generator may add some finalizing code in generator.finish(code), but if we 
    // got this far it is most likely not required. Previous commit has a version executing
    // These final statements.
    workspace.highlightBlock(null);
    runButton.classList.remove('running');
    console.log('Execution finished');
}
