import * as Blockly from 'blockly/core'
import 'blockly/blocks'
import 'blockly/javascript'
import * as BlocklyDE from 'blockly/msg/de'

import * as BlocklyDECustom from './constants/msg'
import './constants/colors'
import './constants/params'

Blockly.setLocale(BlocklyDE);
Blockly.setLocale(BlocklyDECustom);

import './blocks/move'
import './blocks/joint_space_pose'
import './blocks/task_space_pose'
import './blocks/task_space_position'
import './blocks/default_pose'
import './blocks/gripper_open'
import './blocks/gripper_close'
import './blocks/joint_absolute'
import './blocks/joint_relative'
import './blocks/set_speed'
import './blocks/joint_lock'
import './blocks/joint_unlock'
import './blocks/comment'
import './blocks/wait'
import './blocks/is_attached'
import './blocks/physics_done'

<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
//points to block definition for add_sim_object, Lukas
import './blocks/add_sim_object'
import './blocks/pose'

>>>>>>> bd6d1c4 (Changed file names and added pose block)
//imports for adding and removing 3D-objects, Lukas
import { addSimObjects,
         remSimObjects,
<<<<<<< HEAD
         getSimObjectsNames } from '../simulator/objects/objects'
>>>>>>> 39c3638 (You can now pickup things with the robot and place them somewhere. Some cleanup done)
=======
         getSimObjectsNames,
         getSimObjects } from '../simulator/objects/objects'
>>>>>>> 24ac1b4 (Overhaul of the watchBlocks function in blockly.js. The gripper_close function in simulation.js works now as intended.)

//points to block definition for add_sim_object, Lukas
import './blocks/add_sim_object'
import './blocks/pose'

//imports for adding and removing 3D-objects, Lukas
import { addSimObject,
         remSimObjects,
         getSimObjects,
         randomColour } from '../simulator/objects/objects'


import { popSuccess, popWarning, popError, popInfo } from '../alert'

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

const waitToFinish = 200; //Time to wait for the physics simulation to finish. Lukas

var workspace = Blockly.inject(
    blocklyDiv,
    {
        toolbox: document.getElementById('blocks-toolbox'),
        renderer: 'geras',
        horizontalLayout: false,
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
        trashcan: false,
        collapse: false,
        disable: true,
        theme: Blockly.Themes.Rocksi,
    });

// Open the toolbox and keep it open
//workspace.getToolbox().getFlyout().autoClose = false;
//$('blockly-0').click();

// Blockly is not using parenting for its HTML code, so we have to do some manual adjustments.
// TODO For some reason there is a second toolboxFlyout that is never used -> blockly bug?
var toolboxFlyout = $('.blocklyFlyout');
var toolboxScrollbar = $('.blocklyFlyoutScrollbar');

toolboxFlyout.each((idx, element) => {
    var observer = new MutationObserver((mutations, observer) => {
        let flyout = $(element);
        if (flyout.css('display') !== 'none') {
            let scrollbarX = parseInt(flyout.css('left')) + flyout.width() - toolboxScrollbar.width() + 2;
            toolboxScrollbar.css('transform', 'translate(' + scrollbarX + 'px, 2.5px)');
        }
    });
    observer.observe(element, { attributes: true });
});


// React to resize events
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


// Blockly does not open context menus on long presses, so we provide an alternative
if (window.matchMedia('(hover: none)')) {
    $('#blockly-mobile-menu').on('click', evt => {
        console.log(Blockly.selected)
        if (Blockly.selected !== null) {
            console.log('block');
            workspace.getBlockById(Blockly.selected.id).showContextMenu(evt);
        } else {
            console.log('workspace')
            workspace.showContextMenu(evt);
        }
    });
}


// Right click menu item for exporting the workspace
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

// Right click menu item for loading a workspace
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
        upload.setAttribute('accept', '.xml');
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


// Run button
const runButton = document.querySelector('.run-button');

runButton.onclick = function () {
    runButton.classList.toggle('running');
    if (runButton.classList.contains('running')) {
        if (workspace.getTopBlocks(false).length == 0) {
            popWarning(Blockly.Msg['EMPTY_PROGRAM'] || "Empty program");
        }
        //event listener off, lukas
        compileProgram();
        executeProgram();
    }
    else {
        //executionContext.pauseExecution();
        simulation.cancel();
    }

    return false;
};


// Get simulation instance - this is the interface to our 3D robot
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

    wrapper = async function (command, ...args) {
        try {
            pauseExecution();
            await simulation.run(command, ...args);
            executeProgram();
        }
        catch (e) {
            onProgramError(e);
        }
    }
    interpreter.setProperty(globalObject, 'robot',
        interpreter.createNativeFunction(wrapper));
}


var interpreter = null;

function compileProgram() {
    simulation.reset();
    const visible = false;
    simulation.resetSimObjects(visible);
    let code = Blockly.JavaScript.workspaceToCode(workspace);
    console.log(code);
    interpreter = new Interpreter(code, simulationAPI);
}

function pauseExecution() {
    if (interpreter) {
        interpreter.paused_ = true;
    }
}

function executeProgram() {
    if (!interpreter) {
        throw new Error('Program has not been compiled yet');
    }

    interpreter.paused_ = false;

    try {
        // Blocks are being executed until a block interacts with the robot, which will
        // pause execution until the robot is done and then calls run() again.
        // See simulationAPI above.
        let hasMore = interpreter.run();
        if (!hasMore) {
            popInfo('Bitte warten bis die Simulation abgeschlossen ist...');
            waitForPhysicsSim();
        }
    }
    catch (e) {
        onProgramError(e);
    }
}

function waitForPhysicsSim() {
    if (!simulation.getPhysicsDone()) {
        console.log('Waiting ' + waitToFinish * 0.001 + ' seconds...');
        setTimeout(() => {
            waitForPhysicsSim();
        }, waitToFinish );
    } else {
        onProgramFinished();
    }
}

function onProgramError(e) {
    interpreter = null;
    workspace.highlightBlock(null);
    runButton.classList.remove('running');
    simulation.resetSimObjects(true);
    console.error('Program execution failed: ', e);
    popError(e + '\n'
        + (Blockly.Msg['SEE_CONSOLE'] || 'See console for additional details.'));
}

function onProgramFinished() {
    // The generator may add some finalizing code in generator.finish(code), but if we
    // got this far it is most likely not required. Previous commit has a version executing
    // These final statements.
    workspace.highlightBlock(null);
    simulation.resetSimObjects(true);

    runButton.classList.remove('running');
    console.log('Execution finished');
    popSuccess(Blockly.Msg['EXEC_SUCCESS'] || "Program finished");
}

//Determin if a add_sim_object-block was added or removed form the Blockly Workspace.
//If added, add a new 3D-object. If removed remove the 3D-object assosiated with the block.
//Lukas
<<<<<<< HEAD
function watchSpawnBlocks(event) {
    if(Blockly.Events.BLOCK_CREATE === event.type) {
        for (let i = 0; i < event.ids.length; i++) {
            const newBlock = workspace.getBlockById(event.ids[i]);
            if (newBlock.type === 'add_sim_object') {
                const pose = newBlock.getInputTargetBlock('POSE');
                const colour = newBlock.getInputTargetBlock('COLOUR');
                const fieldKeys = ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW'];
                let fieldValues = [];
                let pickedColour;
                if (pose != null) {
                    for (let i = 0; i < fieldKeys.length; i++) {
                        fieldValues.push(pose.getFieldValue(fieldKeys[i]));
                    }
                } else {
                    fieldValues = undefined;
                }
                if (colour != null) {
                    if (colour.type == 'colour_picker') {
                        pickedColour = color.getFieldValue('COLOUR');
                    }
                    if (colour.type == 'colour_random') {
                        pickedColour = randomColour();
                    } else {
                        pickedColour = undefined;
                    }
                }
                console.log(pickedColour);
                addSimObject(newBlock.id, fieldValues, pickedColour);
            }
        }
    }

    if(Blockly.Events.BLOCK_DELETE === event.type) {
        console.log('Deleted: ', event.ids);
        remSimObjects(event.ids);
=======
function watchBlocks(event) {
    //if there is a new block added to the workspace store it
    const newBlock = workspace.getBlockById(event.blockId);

    if (event.type === Blockly.Events.BLOCK_CREATE
        && newBlock != null
        && newBlock.type === 'add_sim_object'){

        //get all ids of currently rendered 3D-block representations
        let simObjectNames = getSimObjectsNames();

        //In case it is the first block, we can add it right away.
        if (simObjectNames.length == 0) {
            console.log('newBlock.id', newBlock.id);
            addSimObjects([newBlock.id]);
        }

        else if (simObjectNames.length > 0) {
            for (let i = 0; i <  simObjectNames.length; i++) {
                if (simObjectNames[i].name == newBlock.id) {
                    console.warn('This simObject already exists: ', newBlock.id);
                }
                else {
                    console.log('newBlock.id', newBlock.id);
                    addSimObjects([newBlock.id]);
                }
            }
        }
    }
<<<<<<< HEAD
    if (event.type === Blockly.Events.BLOCK_DELETE) {
        deletedSimObjects = [...simObjectsIds].filter(blockId =>
                             !currentSimObjectIds.includes(blockId));
        remSimObjects(deletedSimObjects);
        deletedSimObjects = [];
>>>>>>> 7eccd06 (Work on the physics simulation. Some cleanup. Minor changes on the watchBlocks function in blockly.js)
    }
}
<<<<<<< HEAD

workspace.addChangeListener(watchSpawnBlocks);
=======
=======

    if (event.type === Blockly.Events.BLOCK_DELETE) {
        let currentSimObjectBlocks = workspace.getBlocksByType('add_sim_object');
        let simObjects = getSimObjects();
        //Determin if there are any simObjects
        if (simObjects != undefined && simObjects.length > 0) {
            //Determin if there are more simObjects than simObjectBlocks
            if (simObjects > currentSimObjectBlocks) {
                let currentSimObjectBlocksIds = [];

                currentSimObjectBlocks.forEach((block) => {
                    currentSimObjectBlocksIds.push(block.id)
                });

                let deletedSimObjectBlocks = simObjects.filter(simObject =>
                    !currentSimObjectBlocksIds.includes(simObject.name));

                if (deletedSimObjectBlocks.length == 0){
                    console.error('There are untracked SimObjects! Deletion not possible!');
                }

                else {
                    console.log('Deleted SimObjectBlocks: ', deletedSimObjectBlocks);
                    remSimObjects(deletedSimObjectBlocks);
                }
            }
            else if (simObjects < currentSimObjectBlocks) {
                console.error('There are untracked SimObjects! Deletion not possible!');
            }
        }
    }
    if (event.type === Blockly.Events.FINISHED_LOADING) {
        console.log('FINISHED_LOADING');
        let loadedBlocks = workspace.getBlocksByType('add_sim_object');
        let loadedBlocksNames = [];
        loadedBlocks.forEach((block) => { loadedBlocksNames.push(block.id) });
        addSimObjects(loadedBlocksNames);
    }
}

>>>>>>> 24ac1b4 (Overhaul of the watchBlocks function in blockly.js. The gripper_close function in simulation.js works now as intended.)
workspace.addChangeListener(watchBlocks);
>>>>>>> fc4b4db (Fixed the wrong if/else loop in objects.js/getSimobject and objects.js/getSimObjectIdx functions. Some work on integrating the physics in simulation.js. Some cleanup in blockly.js)
