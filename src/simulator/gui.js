import * as UIL from "uil"


const theRobots = ['Franka', 'Niryo'];


var gui = null;
let jointList = null;


export function initGui(robot, cameraControl, renderCall) {
    gui = new UIL.Gui({ css: 'h:20; w: 200; center: true; z-index: 99' });
    gui.add('title', { name: 'Rocksi', prefix: 'v2.0' });

    let robotIdx = getCurrentRobotIndex();
    const robotList = gui.add('list', { name: 'Roboter', list: theRobots, value: robotIdx }).onChange( val => loadRobot(robotList, val) );
    gui.add('button', { name: '', value: ['Ansicht zurücksetzen'], p: 0 }).onChange( val => cameraControl.reset() );
    gui.add('button', { name: '', value: ['Roboter zurücksetzen'], p: 0 }).onChange( val => resetRobot(robot, renderCall) );
    
    let jointValuesRelative = getRobotJointValuesRelative(robot);
    jointList = gui.add('graph', { name: 'Gelenkwinkel', value: jointValuesRelative, neg: true, precision: 2, h:80 }).onChange( vals => updateRobotJoints(robot, vals, renderCall) );

    let ikgroup = gui.add('group', { name: 'IK Gelenke' });
    for (let joint of robot.arm.movable) {
        let active = robot.ikEnabled.includes(joint.name);
        ikgroup.add('bool', { name: joint.name, value: active, h: 20 }).onChange( val => onJointIKChange(robot, joint.name, val) );
    }

    gui.isOpen = false;
    gui.setHeight();
    gui.bottomText = ['Roboter', 'Schließen'];
    gui.bottom.textContent = 'Roboter';
}

export function onRobotMoved(robot) {
    let jointValuesRelative = getRobotJointValuesRelative(robot);
    
    // UIL.Graph doesn't handle setValue properly, so we have to update an internal variable as well
    let normed = jointList.v;
    for (let i = 0; i < jointValuesRelative.length; i++) {
        normed[i] = (1 + jointValuesRelative[i]) / 2;  // * jointList.multiplicator
    }
    jointList.setValue(jointValuesRelative);
};

function getCurrentRobotIndex() {
    let params = new URLSearchParams(location.search);
    let selectedRobot = params.get('robot') || 'Franka';

    for (let idx = 0; idx < theRobots.length; idx++) {
        if (theRobots[idx].toLowerCase() === selectedRobot.toLowerCase()) {
            return idx;
        }
    }

    return 0;
}

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


function loadRobot(robotList, robotName) {
    let robotIdx = getCurrentRobotIndex();
    if (theRobots[robotIdx] === robotName) {
        return;
    }

    let ok = window.confirm("Möchtest du den " + robotName + " Roboter laden? Dein aktuelles Programm geht dabei verloren!");
    if (ok) {
        let baseURL = window.location.href.split('?')[0];
        window.location.replace(baseURL + '?robot=' + robotName);
    }
    else {
        robotList.setList(theRobots, robotIdx);
        robotList.listHide();
    }
}

function resetRobot(robot, renderCallback) {
    for (let jointName in robot.defaultPose) {
        let angle = robot.defaultPose[jointName];
        robot.joints[jointName].setJointValue(angle);
    }
    renderCallback();
}

function updateRobotJoints(robot, values, renderCallback) {
    for (let i = 0; i < robot.arm.movable.length; i++) {
        let joint = robot.arm.movable[i];
        let lower = joint.limit.lower;
        let upper = joint.limit.upper;
        let rel = values[i];
        let abs = lower + (upper - lower) * (rel + 1) / 2;
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