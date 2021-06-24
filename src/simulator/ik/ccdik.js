import { Vector3, ArrowHelper } from 'three'

/*
 * Cyclic Coordinate Descent
 * Inspired by https://zalo.github.io/blog/inverse-kinematics/
 */
class CCDIK {
    constructor(scene, robot) {}

    solve(target, robot, joints, {
        maxIterations = 1,
        stopDistance = 0.1,
        jointLimits = {},
        apply = false
    } = {}) {
        let movable = [];
        if (joints.length) {
            for (let joint of robot.arm.movable) {
                if (joints.includes(joint.name)) {
                    movable.push(joint);
                }
            }
        }
        else {
            movable = robot.arm.movable;
        }

        const orig = {};
        const solution = {};

        let targetPosition = new Vector3();
        let tipPosition = new Vector3();
        let deltaNormal = new Vector3();

        // Using a dummy object or pose always resulted in some slight difference to the actual robot, so
        // we're using the robot as our representation and then reset it to its original configuration later
        for (const joint of movable) {
            orig[joint.name] = joint.angle;
        }

        target.getWorldPosition(targetPosition);
        
        for (let iter = 0; iter < maxIterations; iter++) {
            // Rotate each joint so that the endeffector moves towards the target
            for (let i = movable.length - 1; i >= 0; i--) {
                const joint = movable[i];

                // Vector to the TCP and target from the joint's POV. This algorithm is iterative in the sense 
                // that we update the tip position after every joint adjustment. The solution won't be perfect
                // so running the solver again will improve on the previous solution.
                robot.tcp.object.getWorldPosition(tipPosition);  // changes with each joint!
                let tcpDirection = joint.worldToLocal(tipPosition.clone()).normalize();
                let targetDirection = joint.worldToLocal(targetPosition.clone()).normalize();

                // Project direction vectors onto the joint's rotation plane
                tcpDirection = tcpDirection.projectOnPlane(joint.axis);
                targetDirection = targetDirection.projectOnPlane(joint.axis);
                deltaNormal.crossVectors(tcpDirection, targetDirection).normalize();

                // Depending on which direction we have to turn, the rotation axes will be parallel or anti-parallel
                let alignment = deltaNormal.dot(joint.axis);
                let delta = Math.sign(alignment) * tcpDirection.angleTo(targetDirection);
                let angle = joint.angle + delta;

                // Alternative: more performant, less intuitive (see https://stackoverflow.com/a/33920320/2061551)
                // let v1 = new Vector3();
                // let v2 = new Vector3();
                // let delta = Math.atan2(v1.crossVectors(tcpDirection, targetDirection).dot(joint.axis),
                //     v2.copy(tcpDirection).dot(targetDirection));
                // let angle = joint.angle + delta;
                
                const limit = jointLimits[joint.name];
                if (limit) {
                    if ('lower' in limit && angle < limit['lower']) {
                        // delta = limit['lower'] - joint.angle;
                        angle = Math.max(limit['lower'], angle);
                    }
                    if ('upper' in limit && angle > limit['upper']) {
                        // delta = limit['upper'] - joint.angle;
                        angle = Math.min(limit['upper'], angle);
                    }
                }

                joint.setJointValue(angle);
                solution[joint.name] = joint.angle;
            }

            robot.tcp.object.getWorldPosition(tipPosition);
            if (targetPosition.distanceTo(tipPosition) < stopDistance) {
                //console.log('IK solution found after ' + iter + ' iterations');
                break;
            }
        }

        if (!apply) {
            for (const joint of movable) {
                joint.setJointValue(orig[joint.name]);
            }
        }

        return solution;
    }
};

export default CCDIK;
