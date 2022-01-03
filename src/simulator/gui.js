import * as UIL from "uil"
import { getDesiredLanguage, getDesiredRobot } from "../helpers";
import { addRenderCallback } from "./scene";
import Simulation from "./simulation"
import { localize } from "../helpers";
import { msgBoxInfo } from "../alert";


const theRobots = ['Franka', 'Niryo', 'Sawyer'];
let currentRobotIdx = 0;
{
    let currentRobot = getDesiredRobot().toLowerCase();
    for (let i = 0; i < theRobots.length; i++) {
        if (theRobots[i].toLowerCase() == currentRobot) {
            currentRobotIdx = i;
            break;
        }
    }
}

const theLanguages = ['EN', 'DE'];
let currentLanguageIdx = 0;
{
    let currentLanguage = getDesiredLanguage();
    for (let i = 0; i < theLanguages.length; i++) {
        if (theLanguages[i].toLowerCase() == currentLanguage) {
            currentLanguageIdx = i;
            break;
        }
    }
}


var gui = null;
let jointList = null;


export function initGui(robot, cameraControl, renderCall) {
    gui = new UIL.Gui({ css: 'h:20; w: 200; z-index: 98' });
    gui.content.id = 'robot-gui';

    gui.add('title', { name: 'Rocksi', prefix: 'v2.0' });
    
    const languages = gui.add('list', 
                                { name: localize('gui-language'), 
                                  list: theLanguages, 
                                  value: currentLanguageIdx })
                        .onChange( 
                            val => switchLanguage(languages, val) 
                        );
    
    const robotList = gui.add('list', 
                                { name: localize('gui-robot'), 
                                  list: theRobots, 
                                  value: currentRobotIdx })
                        .onChange( 
                            val => loadRobot(robotList, val) 
                        );

    gui.add('button', 
            { name: '', 
              value: [localize('gui-robot-info')] })
        .onChange( 
            val => showRobotInfo(robot) 
        );

    let gripperButtons = gui.add('button', 
                                    { name: '',
                                      value: [localize('gui-gripper-open'), 
                                      localize('gui-gripper-close')]})
                            .onChange( 
                                val => setGripper(val) 
                            );
    gripperButtons.label(localize('gui-gripper'), 1)

    // let advancedGripping = gui.add('bool', 
    //                                 { name: localize('gui-advanced-gripping'), 
    //                                 value: robot.useAdvancedGripping, 
    //                                 mode: 0 })
    //                             .onChange( 
    //                                 val => { robot.useAdvancedGripping = val; } 
    //                             );
    
    let jointValuesRelative = getRobotJointValuesRelative(robot);
    jointList = gui.add('graph', 
                        { name: localize('gui-joints'), 
                        value: jointValuesRelative, 
                        neg: true, 
                        precision: 2, 
                        h:80 })
                    .onChange( 
                        vals => updateRobotJoints(robot, vals, renderCall) 
                    );

    let ikgroup = gui.add('group', { name: localize('gui-ik-joints') });
    for (let joint of robot.arm.movable) {
        let active = robot.ikEnabled.includes(joint.name);
        ikgroup.add('bool', 
                    { name: joint.name, 
                      value: active, 
                      h: 20 })
                .onChange( 
                    val => onJointIKChange(robot, joint.name, val) 
                );
    }
    
    gui.add('button', 
            { name: '', 
              value: [localize('gui-reset-robot')], 
              p: 0 })
        .onChange( 
            val => resetRobot(robot, renderCall) 
        );

    gui.add('button', 
            { name: '', 
              value: [localize('gui-reset-view')], 
              p: 0 })
        .onChange( 
            val => cameraControl.reset() 
        );

    gui.isOpen = false;
    gui.setHeight();
    gui.bottomText = [localize('gui-robot'), localize('gui-close')];
    gui.bottom.textContent = localize('gui-robot');

    addRenderCallback(onRobotMoved);
}

export function show() {
    gui.hide(false);
}

export function hide() {
    gui.hide(true);
}

function onRobotMoved(robot) {
    let jointValuesRelative = getRobotJointValuesRelative(robot);
    
    // UIL.Graph doesn't handle setValue properly, so we have to update an internal variable as well
    let normed = jointList.v;
    for (let i = 0; i < jointValuesRelative.length; i++) {
        normed[i] = (1 + jointValuesRelative[i]) / 2;  // * jointList.multiplicator
    }
    jointList.setValue(jointValuesRelative);
};


function getRobotJointValuesRelative(robot) {
    let values = [];
    for (let joint of robot.arm.movable) {
        let angle = joint.angle;
        let lower = joint.limit.lower;
        let upper = joint.limit.upper;
        let rel = (angle - lower) / (upper - lower) * 2 - 1.0;
        values.push(rel);
    }
    return values;
}


function switchLanguage(guiLanguageList, language) {
    if (theLanguages[currentLanguageIdx] === language) {
        return;
    }

    let ok = window.confirm(localize('gui-confirm-switch-language', language));
    if (ok) {
        let url = window.location;
        let params = new URLSearchParams(url.search);
        params.set('lang', language);
        window.location.replace(url.origin + url.pathname + '?' + params.toString());
    }
    else {
        guiLanguageList.setList(theLanguages, currentLanguageIdx);
        guiLanguageList.close();
    }
}

function loadRobot(guiRobotList, robotName) {
    if (theRobots[currentRobotIdx] === robotName) {
        return;
    }

    let ok = window.confirm(localize('gui-confirm-switch-robot', robotName));
    if (ok) {
        let url = window.location;
        let params = new URLSearchParams(url.search);
        params.set('robot', robotName);
        window.location.replace(url.origin + url.pathname + '?' + params.toString());
    }
    else {
        guiRobotList.setList(theRobots, robotIdx);
        guiRobotList.close();
    }
}

function showRobotInfo(robot) {
    msgBoxInfo({ closeTime: 20000 }).show(localize(robot.name.toLowerCase() + '-info'));
}


function setGripper(val) {
    Simulation.getInstance().then(sim => {
        switch (val) {
            case localize('gui-gripper-open'):
                sim.gripper_open();
                break;

            case localize('gui-gripper-close'):
                sim.gripper_close();
                break;

            default: 
                console.error('GUI event "' + val + '" not handled');
        }
    });
}

function updateRobotJoints(robot, values, renderCallback) {
    for (let i = 0; i < robot.arm.movable.length; i++) {
        let joint = robot.arm.movable[i];
        let lower = joint.limit.lower;
        let upper = joint.limit.upper;
        let rel = values[i];
        let abs = lower + (upper - lower) * (rel + 1) / 2;
        
        // We could also use robot.setPose, but since we already have the joint this is easier
        joint.setJointValue(abs);
    }
    renderCallback();
}

function onJointIKChange(robot, jointName, enabled) {
    let idx = robot.ikEnabled.indexOf(jointName);
    if (enabled && idx < 0) {
        robot.ikEnabled.push(jointName);
    }
    else if (!enabled && idx >= 0) {
        robot.ikEnabled.splice(idx, 1);
    }
}

function resetRobot(robot, renderCallback) {
    for (let jointName in robot.defaultPose) {
        let angle = robot.defaultPose[jointName];
        robot.joints[jointName].setJointValue(angle);
    }
    renderCallback();
}