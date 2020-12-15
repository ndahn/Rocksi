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

function getDuration(target, vmax) {
    let smax = 0.0;

    // Find the joint that has to move the farthest
    for (const joint in target) {
        smax = Math.max(smax, Math.abs(joint.angle - target[joint]));
    }

    return smax / vmax;
}

class TheSimulation {
    constructor(robot, renderCallback) {
        this._robot = robot;
        this._renderCallback = renderCallback;

        this.running = false;
        this.velocities = {
            gripper: 1000,
            move: 3000,
            joint: 2000,
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

        let tweenFinished = false;
        p.then(msg => {
            console.log(command + '(' + args + '):' + msg);
            tweenFinished = true;
        });

        function wait() {
            if (!tweenFinished) {
                setTimeout(wait, 20);
            }
        }
        wait();
    }

    cancel() {
        console.log('cancel');
        // Will prevent further callbacks to _animate
        this.running = false;
        // As this is called by _onTweenFinished, this prevents having multiple tweens
        // with different end times, but that's not a use case at the moment
        TWEEN.removeAll();
    }


    gripper_close(resolve, reject) {
        console.log('Closing hand');
        
        const robot = this._robot;
        const start = {};
        const target = {};

        for (const finger of robot.fingers) {
            start[finger.name] = finger.angle;
            target[finger.name] = finger.limit.lower;  // fully closed
        }

        const duration = getDuration(target, this.velocities.gripper);
        let tween = this._makeTween(start, target, duration, resolve, reject);
        this._start(tween);
    }

    gripper_open(resolve, reject) {
        console.log('Opening hand');

        const robot = this._robot;
        const start = {};
        const target = {};
        
        for (const finger of robot.fingers) {
            start[finger.name] = finger.angle;
            target[finger.name] = finger.limit.upper;  // fully opened
        }
        
        const duration = getDuration(target, this.velocities.gripper);
        let tween = this._makeTween(start, target, duration, resolve, reject);
        this._start(tween);
    }

    joint_absolute(resolve, reject, jointIdx, angle) {
        console.log('Setting joint ' + jointIdx + ' to ' + angle + ' degrees');

        const start = {};
        const target = {};
        
        const joint = this._robot.jointsOrdered[jointIdx - 1];
        start[joint.name] = joint.angle;
        target[joint.name] = clampJointAngle(joint, deg2rad(angle));
        
        const duration = getDuration(target, this.velocities.joint);
        let tween = this._makeTween(start, target, duration, resolve, reject);
        this._start(tween);
    }

    joint_relative(resolve, reject, jointIdx, angle) {
        console.log('Rotating joint ' + jointIdx + ' by ' + angle + ' degrees');

        const joint = this._robot.jointsOrdered[jointIdx - 1];
        let angleAbs = joint.angle * 180.0 / Math.PI + angle;  // degrees
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
                
                for (let i = 0; i < pose.length; i++) {
                    const joint = robot.jointsOrdered[i];
                    start[joint.name] = joint.angle;
                    target[joint.name] = clampJointAngle(joint, deg2rad(pose[i]));
                }
                
                const duration = getDuration(target, this.velocities.move);
                let tween = this._makeTween(start, target, duration, resolve, reject);
                this._start(tween);
                break;

            default:
                console.error('move() cannot handle array of length ' + pose.length)
        }
    }


    _makeTween(start, target, duration, resolve, reject) {
        const robot = this._robot;

        let tween = new TWEEN.Tween(start)
            .to(target, duration)
            .easing(TWEEN.Easing.Quadratic.Out);

        tween.onUpdate(object => {
            for (const joint in object) {
                robot.joints[joint].setJointValue(object[joint]);
            }
        });

        tween.onComplete(object => {
            this.running ? resolve('success') : reject('tween obsolete');
            this.cancel();
        });

        return tween;
    }

    _start(tween) {
        if (this.running) {
            return;
        }

        this.running = true;
        tween.start();
        // => captures the 'this' reference
        window.requestAnimationFrame(() => this._animate());
    }

    _animate(time) {
        TWEEN.update(time);
        this._renderCallback();

        if (this.running) {
            // => captures the 'this' reference
            window.requestAnimationFrame(() => this._animate());
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
