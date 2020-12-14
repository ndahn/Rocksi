import { MinEquation } from 'three';

var TWEEN = require('@tweenjs/tween.js');


function deg2rad(deg) {
    return deg * Math.PI / 180.0;
}

function clampJointAngle(joint, angle) {
    //let min = joint.limit.lower;
    //let max = joint.limit.upper;

    // Using the actual joint limits without user feedback is unintuitive
    let min = -Math.PI;
    let max = Math.PI;
    return Math.min(max, Math.max(min, angle % Math.PI));
}

class TheSimulation {
    constructor(robot, renderCallback) {
        this._robot = robot;
        this._renderCallback = renderCallback;

        this.running = false;
        this.durations = {
            gripper: 1.0,
            move: 5.0,
            joint: 2.0,
        }
    }

    
    run(command, ...args) {
        let p = new Promise((resolve, reject) => {
            try {
                this[command](resolve, reject, ...args);
            }
            catch (e) {
                console.error('Failed to run command \'' + command + '(' + args + ')\':' + e);
                reject(e);
            }
        });

        p.then(msg => {
            console.log(command + '(' + args + '):' + msg);
        });
    }

    cancel() {
        // Will prevent further callbacks to _animate
        this.running = false;
        // As this is called by _onTweenFinished, this prevents having multiple tweens
        // with different end times, but that's not a use case at the moment
        TWEEN.removeAll();
    }


    _start(tween, duration, resolve, reject) {
        if (this.running) {
            return;
        }

        this.running = true;

        tween.start();
        setTimeout(duration, () => {
            this._onTweenFinished(tween, resolve, reject);
        });

        window.requestAnimationFrame(_animate);
    }

    _animate(time) {
        TWEEN.update(time);
        this._renderCallback();

        if (this.running) {
            window.requestAnimationFrame(_animate);
        }
    }

    _onTweenFinished(tween, resolve, reject) {
        this.running ? resolve('success') : reject('tween obsolete');
        cancel();
    }

    _makeTween(start, target, duration) {
        const robot = this._robot;

        let tween = new TWEEN.Tween(start)
            .to(target, duration)
            .easing(TWEEN.Easing.Quadratic.Out);

        tween.onUpdate(function (object) {
            for (const j in robot.joints) {
                robot.joints[j].setJointValue(object[j]);
            }
        });
    }


    gripper_close(resolve, reject) {
        console.log('Closing hand');
        
        const robot = this._robot;
        const start = {};
        const target = {};
        const duration = this.durations.gripper;

        for (const finger of robot.fingers) {
            start[finger.name] = finger.angle();
            target[finger.name] = finger.limit.lower;  // fully closed
        }

        let tween = this._makeTween(start, target, duration);
        this._start(tween, duration, resolve, reject);
        break;
    }

    gripper_open(resolve, reject) {
        console.log('Opening hand');

        const robot = this._robot;
        const start = {};
        const target = {};
        const duration = this.durations.gripper;

        for (const finger of robot.fingers) {
            start[finger.name] = finger.angle();
            target[finger.name] = finger.limit.upper;  // fully opened
        }

        let tween = this._makeTween(start, target, duration);
        this._start(tween, duration, resolve, reject);
        break;
    }

    joint_absolute(resolve, reject, jointIdx, angle) {
        console.log('Setting joint ' + jointIdx + ' to ' + angle + ' degrees');

        const start = {};
        const target = {};
        const duration = this.durations.joint;
        
        const joint = this._robot.jointsOrdered[jointIdx];
        start[joint.name] = joint.angle();
        target[joint.name] = clampJointAngle(joint, deg2rad(angle));

        let tween = this._makeTween(start, target, duration);
        this._start(tween, duration, resolve, reject);
    }

    joint_relative(resolve, reject, jointIdx, angle) {
        console.log('Rotating joing ' + jointIdx + ' by ' + angle + ' degrees');

        const joint = this._robot.jointsOrdered[jointIdx];
        let angleAbs = joint.angle() * 180.0 / Math.PI + angle;  // degrees
        return this.joint_absolute(resolve, reject, jointIdx, angleAbs);
    }

    move(resolve, reject, pose) {
        switch (pose.length) {
            case 6:
                // Task space pose
                console.log('Moving robot to task space pose ' + pose);

                // TODO Calculate joint angles through inverse kinematic, fall through to Joint Space Pose
                console.error('Task space poses not supported yet');
                break;
            
            case 7:
                // Joint space pose
                console.log('Moving robot to joint space pose ' + pose);

                const robot = this._robot;
                const start = {};
                const target = {};
                const duration = this.durations.move;

                for (let i = 0; i < pose.length; i++) {
                    const joint = robot.jointsOrdered[i];
                    start[joint.name] = joint.angle();
                    target[joint.name] = clampJointAngle(joint, deg2rad(pose[i]));
                }

                let tween = this._makeTween(start, target, duration);
                this._start(tween, duration, resolve, reject);
                break;
            
            default:
                console.error('move() cannot handle array of length ' + pose.length)
        }
    }
}

const Simulation = {
    _simulation: null,
    _awaiting: [],

    getInstance: function(callback) {
        let s = this._simulation;
        if (s) {
            // Immediate callback
            callback(s);
        }
        else {
            // Wait for simulation to be initialized
            this._awaiting.push(callback);
        }
    },

    init: function(robot, renderCallback) {
        let s = this._simulation = new TheSimulation(robot, renderCallback);
        this._awaiting.forEach(cb => cb(s));
        this._awaiting = []
    }
};

export default Simulation;
