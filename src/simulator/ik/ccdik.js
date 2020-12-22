import { Vector3, Quaternion } from 'three'

/*
 * Cyclic Coordinate Descent
 * Inspired by https://zalo.github.io/blog/inverse-kinematics/
 */
class CCDIK {
    constructor(scene, robot) { }

    solve(target, tip, joints, jointLimits = {}) {
        if (typeof joints === 'undefined') {
            joints = robot.arm.movable;
        }

        const solution = {};

        let targetPosition = new Vector3();
        let tipPosition = new Vector3();
        let deltaNormal = new Vector3();

        target.getWorldPosition(targetPosition);
        
        for (let i = joints.length - 1; i >= 0; i--) {
            const joint = joints[i];

            // Vector to the TCP and target from the joint's POV. This algorithm is iterative in the sense 
            // that we update the tip position after every joint adjustment. The solution won't be perfect
            // so running the solver again will improve on the previous solution.
            tip.getWorldPosition(tipPosition);
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

            // Alternative, more performant, less intuitive (see https://stackoverflow.com/a/33920320/2061551)
            // let v1 = new Vector3();
            // let v2 = new Vector3();
            // let delta = Math.atan2(v1.crossVectors(tcpDirection, targetDirection).dot(joint.axis),
            //     v2.copy(tcpDirection).dot(targetDirection));
            // let angle = joint.angle + delta;
            
            const limit = jointLimits[joint.name];
            if (limit) {
                if ('lower' in limit) {
                    angle = Math.max(limit['lower'], angle);
                }
                if ('upper' in limit) {
                    angle = Math.min(limit['upper'], angle);
                }
            }

            // TODO calculate updated tcp position so that we can calculate a solution without updating the model
            // This could be done in world coordinates
            joint.setJointValue(angle);
            solution[joint.name] = angle;
        }

        return solution;
    }
};

export default CCDIK;
