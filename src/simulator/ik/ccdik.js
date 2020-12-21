import { Vector3, Quaternion } from 'three'

class CCDIK {
    constructor(scene, robot) { }

    solve(scene, robot, targetPosition) {
        const solution = {};
        robot.loadedModel.updateWorldMatrix(false, true);

        let tcpPosition = new Vector3();
        let fromToQuat = new Quaternion();
        
        for (let i = robot.jointsOrdered.length - 1; i >= 0; i--) {
            const joint = robot.jointsOrdered[i];
            if (!robot.isArm(joint) || joint._jointType === 'fixed' || typeof joint.axis === 'undefined') {
                continue;
            }

            // For the most part we follow this tutorial, i.e. we're trying to let the joint point
            // the end effector towards the target and then constrain the angle to the hinge:
            // https://zalo.github.io/blog/inverse-kinematics/
            robot.tcp.getWorldPosition(tcpPosition);
            let tcpDirection = joint.worldToLocal(tcpPosition).normalize();
            let targetDirection = joint.worldToLocal(targetPosition.clone()).normalize();

            tcpDirection = tcpDirection.projectOnPlane(joint.axis);
            targetDirection = targetDirection.projectOnPlane(joint.axis);
            fromToQuat.setFromUnitVectors(tcpDirection, targetDirection);
            
            // V1
            // This approach would (almost) work, but we need to calculate the hinge angle and use setJointValue
            //joint.quaternion.multiply(joint.quaternion);

            // V2
            //fromToQuat.premultiply(joint.quaternion);
            //let angle = joint.angle + Math.acos(fromToQuat.w) * 2;

            // V3
            let angle = joint.angle + tcpDirection.angleTo(targetDirection);

            // V4
            //fromToQuat.premultiply(joint.quaternion.clone().conjugate());
            //let ftqNorm = new Vector3().set(fromToQuat.x, fromToQuat.y, fromToQuat.z).length();
            //let angle = Math.atan2(ftqNorm, fromToQuat.w) * 2;
            
            solution[joint.name] = angle;
        }

        console.log(solution);
        return solution;
    }
};

export default CCDIK;
