var TWEEN = require('@tweenjs/tween.js');

class TheSimulation {
    constructor(robot, renderCallback) {
        this._robot = robot;
        this._renderCallback = renderCallback;
        this._tween = null;

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

        const t = this._tween;
        t && t.stop();
    }

    _start(duration, resolve, reject) {
        if (this.running) {
            return;
        }

        this.running = true;

        this._tween.start();
        setTimeout(duration, () => {
            this._onTweenFinished(resolve, reject);
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

    _onTweenFinished(resolve, reject) {
        this.running ? resolve('success') : reject('tween obsolete');
        cancel();
    }


    gripper_close(resolve, reject) {
        console.log('Closing hand');
        
        // TODO setup tween
        
        this.start();
        setTimeout(this.durations.gripper, () => {
            this._onTweenFinished(resolve, reject);
        });
    }

    gripper_open(resolve, reject) {
        console.log('Opening hand');
    }

    joint_absolute(resolve, reject, joint, angle) {
        console.log('Setting joint ' + joint + ' to ' + angle + ' degrees');
    }

    joint_relative(resolve, reject, joint, angle) {
        console.log('Rotating joing ' + joint + ' by ' + angle + ' degrees');
    }

    move(resolve, reject, pose) {
        switch (pose.length) {
            case 6:
                // Task space pose
                console.log('Moving robot to task space pose ' + pose);
                break;
            
            case 7:
                // Joint space pose
                console.log('Moving robot to joint space pose ' + pose);

                const duration = this.durations.move;
                const target = {};
                const robot = this.robot;
                const tweenParams = [];

                for (const j in robot.joints) {
                    const joint = robot.joints[j];
                    
                    // We expect joints with only a single degree of freedom
                    tweenParams[j] = joint.jointValue[0];

                    // Get the last number from the name (should work for most models)
                    // Assuming the robot follows Denavit Hartenberg the first joint index will be 1
                    let idx = joint.name.match(/(\d)(?=[^\d]+$)/g);
                    target[j] = pose[idx - 1];
                }

                this._tween = new TWEEN.Tween(tweenParams)
                    .to(target, duration)
                    .easing(TWEEN.Easing.Quadratic.Out);

                this._tween.onUpdate(function (object) {
                    for (const j in robot.joints) {
                        robot.joints[j].setJointValue(object[j]);
                    }
                });

                this._start(duration, resolve, reject);
                break;
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
