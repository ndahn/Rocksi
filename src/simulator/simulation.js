import { Object3D, Vector3, Euler } from "three"

//function for updating the physics
import { updatePhysics,
         isWorldActive,
         updateBodies, } from './physics'

var TWEEN = require('@tweenjs/tween.js');

import { isAttached,
         getAttachedObject,
         getSimObjects,
         getSimObjectByPos,
         getSimObjectIdx } from "./objects/createObjects"



const _slowdown_factor = 1.5;


function deg2rad(deg) {
    return deg * Math.PI / 180.0;
}

function clampJointAngle(joint, angle) {
    // ROS is limiting the joint values by itself, but this prevents long tweens
    // where nothing happens because a joint is already past its limit
    let min = joint.limit.lower;
    let max = joint.limit.upper;
    return Math.min(max, Math.max(min, angle));
}

function getDuration(robot, target, vmax) {
    let smax = 0.0;

    // Find the joint that has to move the farthest
    for (const j in target) {
        smax = Math.max(smax, Math.abs(robot.joints[j].angle - target[j]));
    }

    return smax / vmax * 1000 * _slowdown_factor;  // ms
}

class TheSimulation {
    constructor(robot, ik, renderCallback) {
        this.robot = robot;
        this.ik = ik;
        this.renderCallback = renderCallback;

        this.lockedJointIndices = [];

        this.running = false;
        this.velocities = {}
        this.setDefaultVelocities();

        //Physics and triggers
        this.runningPhysics = false;
        this.physicsDone = true;
        this.lastSimObjectProcessed = false;
    }


    reset() {
        this.unlockJoints();
        this.setDefaultVelocities();

        this.physicsDone = true;
        this.lastSimObjectProcessed = false;
        this.runningPhysics = false;
    }

    //Resets the simObjects to the position and orientation in the pose block.
    resetSimObjects(visible = true) {
        const simObjects = getSimObjects();
        for (const simObject of simObjects) {
            if (simObject.attached) {
                simObject.detachFromGripper(this.robot);
            }
            simObject.reset();
            if (visible) {
                simObject.makeVisible();
            }
            else {
                simObject.hide();
            }
        }
    }

    async run(command, ...args) {
        const sim = this;
        const validCommands = {
            'cancel': sim.cancel,
            'setParam': sim.setParam,
            'lockJoint': sim.lockJoint,
            'unlockJoint': sim.unlockJoint,
            'wait': sim.wait,
            'move': sim.move,
            'gripper_close': sim.gripper_close,
            'gripper_open': sim.gripper_open,
            'joint_absolute': sim.joint_absolute,
            'joint_relative': sim.joint_relative,
            'startPhysicalBody': sim.startPhysicalBody,
            'getPhysicsDone': sim.getPhysicsDone,
        };

        try {
            await validCommands[command].call(this, ...args);
        }
        catch (e) {
            console.error('Failed to run command \'' + command + '(' + args + ')\':' + e);
            throw (e);
        }
    }

    cancel() {
        console.log('cancel');
        // Will prevent further callbacks to _animate
        this.running = false;

        for (const t of TWEEN.getAll()) {
            t.stop();
        }
        // As this is called by _onTweenFinished, this prevents having multiple tweens
        // with different end times, but that's not a use case at the moment
        TWEEN.removeAll();
        this.runningPhysics = false;
        this.physicsDone = true;
        this.lastSimObjectProcessed = true;

    }

    setParam(param, value) {
        console.log('> Setting ' + param + ' to ' + value);
        try {
            if (param.startsWith('velocity')) {
                let motion = param.split('/')[1];
                value = parseFloat(value);
                switch (motion) {
                    case 'move':
                        this.velocities.move = value;
                        break;
                    case 'gripper':
                        this.velocities.gripper = value;
                        break;
                    default:
                        throw ('invalid parameter \'' + param + '=' + value + '\'');
                }
            }
            else {
                throw ('unknown parameter');
            }
        } catch (e) {
            console.warn('! Failed to set ' + param + ': ' + e);
        }
    }

    setDefaultVelocities() {
        console.log('> Resetting velocities to defaults');

        this.velocities = {
            move: 0.5,
            gripper: 0.5
        };
    }

    lockJoint(jointIdx) {
        console.log('> Locking joint ' + jointIdx);

        if (this.lockedJointIndices.includes(jointIdx)) {
            console.warn('! ... but joint ' + jointIdx + ' is already locked');
            return;
        }

        this.lockedJointIndices.push(jointIdx);
    }

    unlockJoint(jointIdx) {
        console.log('> Unlocking joint ' + jointIdx);
        let idx = this.lockedJointIndices.indexOf(jointIdx);

        if (idx < 0) {
            console.warn('! ... but joint ' + jointIdx + ' is not locked');
            return;
        }

        this.lockedJointIndices.splice(idx, 1);
    }

    unlockJoints() {
        console.log('> Unlocking all joints');
        this.lockedJointIndices = [];
    }

    getJointSpacePose() {
        const robot = this.robot;
        const pose = [];

        for (let idx = 0; idx < robot.arm.movable.length; idx++) {
            const joint = robot.arm.movable[idx];
            pose.push(joint.angle);
        }

        return pose;
    }

    getTaskSpacePose() {
        const pose = [];

        const m = this.robot.tcp.object.matrixWorld;
        const pos = new Vector3();
        pos.setFromMatrixPosition(m);
        const rot = new Euler();
        rot.setFromRotationMatrix(m);

        // x, y, z, roll, pitch, yaw
        pose.push(pos.x, pos.y, pos.z, rot.x, rot.y, rot.z);
        return pose;
    }

    wait(ms) {
        console.log('> Waiting ' + ms + ' ms');
        return new Promise(resolve => {
            setTimeout(() => resolve('success'), ms);
        });
    }


    move(poseType, pose) {
        if (!pose) {
            throw new Error('move failed: missing pose');
        }

        // Seems to be a weird bug in js-interpreter concerning varargs and arrays
        if (pose.class === 'Array' && pose.length === undefined) {
            let newPose = [];
            for (const p in pose.properties) {
                if (p.match(/\d+/g)) {
                    newPose[p] = pose.properties[p];
                }
            }
            pose = newPose;
        }

        const robot = this.robot;
        const start = {};
        const target = {};

        switch (poseType) {
            case 'TaskspacePose':
                // Task space pose
                console.log('> Moving robot to task space pose ' + pose);

                const ikTarget = new Object3D();
                ikTarget.position.set(pose[0], pose[1], pose[2]);
                if (pose.length > 3) {
                    ikTarget.setRotationFromEuler(new Euler(pose[3], pose[4], pose[5]));
                } else {
                    ikTarget.setRotationFromQuaternion(robot.tcp.object.quaternion);
                }

                const solution = this.ik.solve(
                    ikTarget,
                    robot,
                    robot.ikEnabled,
                    {
                        // This should be precise to avoid surprises for the user
                        maxIterations: 30,
                        stopDistance: 0.05,
                        jointLimits: robot.interactionJointLimits,
                        apply: false
                    }
                );

                for (let i = 0; i < pose.length; i++) {
                    const joint = robot.arm.movable[i];
                    if (joint.name in solution) {
                        start[joint.name] = joint.angle;
                        target[joint.name] = solution[joint.name];
                    }
                }

                break;

            case 'JointspacePose':
                // Joint space pose
                console.log('> Moving robot to joint space pose ' + pose);

                for (let i = 0; i < pose.length; i++) {
                    const joint = robot.arm.movable[i];
                    start[joint.name] = joint.angle;
                    target[joint.name] = clampJointAngle(joint, deg2rad(pose[i]));
                }

                break;

            default:
                console.error('# unknown configuration space \'' + poseType + '\'');
                return;
        }

        const duration = getDuration(robot, target, this.velocities.move * robot.maxSpeed.move);
        let tween = this._makeTween(start, target, duration);
        return tween;
    }

    gripper_close() {
        console.log('> Closing hand');

        const robot = this.robot;
        const start = {};
        const target = {};
        const tcp = robot.tcp.object;
        let position = new Vector3();

        tcp.getWorldPosition(position);

        if (isAttached()) {
            // An object is already attached to the gripper, we can't grip another one
            console.log('... but an object is already held');
            throw new Error('already gripping');
        }

        const simObject = getSimObjectByPos(position);//Retruns a simObject, if tcp is inside a box around it
        //Gripping a simObject if it is available
        if (simObject != undefined
            && simObject.isGrippable()) 
        {
            if (!robot.useAdvancedGripping
                || simObject.isGrippableAxisIndependent()
                || simObject.checkGripperOrientation(robot))
            {
                simObject.attachToGripper(robot);

                for (const finger of robot.hand.movable) {
                    start[finger.name] = finger.angle;
                    target[finger.name] = finger.states.closed;  // fully closed
                }

            }
            else {
                console.log('... but object does not fit inside gripper (realistic gripping is on)');
                throw new Error('ungrippable');
            }
        }
        //if not, close full
        else {
            for (const finger of robot.hand.movable) {
                start[finger.name] = finger.angle;
                target[finger.name] = finger.states.closed;  // fully closed
            }
        }

        const duration = getDuration(robot, target, this.velocities.gripper);
        let tween = this._makeTween(start, target, duration);
        return tween;
    }

    gripper_open() {
        console.log('> Opening hand');

        const robot = this.robot;
        const start = {};
        const target = {};

        // If an object is currently gripped, detach it from the gripper
        // and activate the physics
        if (isAttached() == true) {
            const simObject = getAttachedObject();
            simObject.detachFromGripper(robot);
            const idx = getSimObjectIdx(simObject.name);
            if (!this.runningPhysics) {
                this.startPhysicalBody(idx);
            }
        }

        for (const finger of robot.hand.movable) {
            start[finger.name] = finger.angle;
            target[finger.name] = finger.states.opened;  // fully opened
        }

        const duration = getDuration(robot, target, this.velocities.gripper);
        let tween = this._makeTween(start, target, duration);
        return tween;
    }

    joint_absolute(jointIdx, angle) {
        console.log('> Setting joint ' + jointIdx + ' to ' + angle + ' degrees');

        if (this.lockedJointIndices.includes(jointIdx)) {
            console.log('> ... but joint ' + jointIdx + ' is locked');
            throw new Error('locked');
        }

        const robot = this.robot;
        const start = {};
        const target = {};

        const joint = robot.arm.movable[jointIdx - 1];
        start[joint.name] = joint.angle;
        target[joint.name] = clampJointAngle(joint, deg2rad(angle));

        const duration = getDuration(robot, target, this.velocities.move * robot.maxSpeed.move);
        let tween = this._makeTween(start, target, duration);
        return tween;
    }

    joint_relative(jointIdx, angle) {
        console.log('> Rotating joint ' + jointIdx + ' by ' + angle + ' degrees');

        const joint = this.robot.arm.movable[jointIdx - 1];
        let angleAbs = joint.angle * 180.0 / Math.PI + angle;  // degrees
        return this.joint_absolute(jointIdx, angleAbs);
    }

    //Activate simObject and start physics if not already running
    startPhysicalBody(simObjectsIdx) {
        const simObjects = getSimObjects();
        this.physicsDone = false;
        if (simObjects[simObjectsIdx].wasGripped) {
            simObjects[simObjectsIdx].wasGripped = false;
        } else {
            simObjects[simObjectsIdx].reset();
        }
        simObjects[simObjectsIdx].visible = true;
        simObjects[simObjectsIdx].addBodyToWorld();
        simObjects[simObjectsIdx].updateBody();
        simObjects[simObjectsIdx].body.wakeUp();
        if (simObjectsIdx + 1 >= simObjects.length) {
            this.lastSimObjectProcessed = true;
        }
        if (!this.runningPhysics) {
            this._animatePhysics();
            this.runningPhysics = true;
        }
    }

    //Returns state of physics simulation
    getPhysicsDone() {
        const simObjects = getSimObjects();
        if (simObjects.length > 0) {
            if ( !this.runningPhysics
                 && this.lastSimObjectProcessed
                 && !isWorldActive()) {

                     this.physicsDone = true;
            } else {
                this.physicsDone = false;
            }
        }
        return this.physicsDone;
    }

    //Physics animation loop
    _animatePhysics() {
        updatePhysics(); //Updates the 3D object positions and orientations 
        this.renderCallback();
        if (!isWorldActive()) {
            console.log('Physics rendering halted.');
            this.runningPhysics = false;
            return;
        }
        window.requestAnimationFrame(() => this._animatePhysics());
    }

    _makeTween(start, target, duration) {
        return new Promise((resolve, reject) => {
            const robot = this.robot;

            // Locked joints should not be animated
            for (const jidx of this.lockedJointIndices) {
                const name = robot.arm.movable[jidx].name;
                delete target[name];
            }

            let tween = new TWEEN.Tween(start)
                .to(target, duration)
                .easing(TWEEN.Easing.Quadratic.Out);

            tween.onUpdate(object => {
                for (const j in object) {
                    robot.model.joints[j].setJointValue(object[j]);
                }
            });

            tween.onComplete(object => {
                this.running = false;
                resolve('success');
            });

            tween.onStop(object => {
                this.running = false;
                reject('tween obsolete');
            });

            tween.start();

            if (!this.running) {
                this.running = true;
                // => captures the 'this' reference
                window.requestAnimationFrame(() => this._animate());
            }
        });
    }

    _animate(time) {

        TWEEN.update(time);
        this.renderCallback();

        if (this.running) {
            // => captures the 'this' reference
            window.requestAnimationFrame(() => this._animate());
        }
    }
}


/*
 * Singleton with async getter, will be initialized by the robot simulator.
 */
const Simulation = {
    instance: null,
    _awaiting: [],

    getInstance: function () {
        if (this.instance) {
            return Promise.resolve(this.instance);
        }
        else {
            let p = new Promise(resolve => this._awaiting.push(resolve));
            return p;
        }
    },

    init: function(robot, ik, renderCallback) {
        this.instance = new TheSimulation(robot, ik, renderCallback);
        this._awaiting.forEach(p => p(this.instance));
        this._awaiting = []
    }
};


export default Simulation;
