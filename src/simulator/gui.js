import * as UIL from "uil"


var gui = null;
const theRobots = ['Franka', 'Niryo'];


export function initGui(robot, cameraControl, renderCallback) {
    gui = new UIL.Gui({ css: 'h:20; w: 200; center: true; z-index: 99' });
    gui.add('title', { name: 'Rocksi', prefix: 'v2.0' });

    let robotIdx = getCurrentRobotIndex();
    const robotList = gui.add('list', { name: 'Roboter', list: theRobots, value: robotIdx }).onChange( val => loadRobot(robotList, val) );
    gui.add('button', { name: '', value: ['Ansicht zurücksetzen'], p: 0 }).onChange( val => cameraControl.reset() );
    gui.add('button', { name: '', value: ['Roboter zurücksetzen'], p: 0 }).onChange( val => resetRobot(robot, renderCallback) );
    
    let ikgroup = gui.add('group', { name: 'IK Gelenke' });
    for (let joint of robot.arm.movable) {
        let active = robot.ikEnabled.includes(joint.name);
        ikgroup.add('bool', { name: joint.name, value: active, h: 20 }).onChange( val => onJointIKChange(robot, joint.name, val) );
    }

    gui.isOpen = false;
    gui.testHeight();
    gui.bottom.textContent = 'Roboter';
}


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

function resetRobot(robot, renderCallback) {
    for (let jointName in robot.defaultPose) {
        let angle = robot.defaultPose[jointName];
        robot.joints[jointName].setJointValue(angle);
    }
    renderCallback();
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

function onJointIKChange(robot, jointName, enabled) {
    let idx = robot.ikEnabled.indexOf(jointName);
    if (enabled && idx < 0) {
        robot.ikEnabled.push(jointName);
    }
    else if (!enabled && idx >= 0) {
        robot.ikEnabled.splice(idx, 1);
    }
}