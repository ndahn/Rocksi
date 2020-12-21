import { Vector3, Quaternion } from 'three'

class CCDIK {
    constructor(scene, robot) { }

    solve(scene, robot, targetPosition) {
        const solution = {};
        robot.loadedModel.updateWorldMatrix(false, true);

        let tcpPosition = new Vector3();
        let fromToQuat = new Quaternion();
        let axis = new Vector3();
        
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

            // This approach would work, but we need to calculate the hinge angle and use setJointValue
            //joint.quaternion.multiply(joint.quaternion);

            //fromToQuat.premultiply(joint.quaternion);
            
            let angle = Math.acos(fromToQuat.w) * 2;
            solution[joint.name] = joint.angle + angle;

            /*
            axis.copy(joint.axis);
            axis.applyMatrix4(joint.parent.matrixWorld);
            axis.applyMatrix4(joint.matrix);
            joint.worldToLocal(axis);

            let p = new Vector3();
            joint.getWorldPosition(p);
            p.z += 2;
            let arrow = new ArrowHelper(axis, p);
            scene.add(arrow);
            
            // Project directions onto joint rotation plane and get the angle in between
            tcpDirection = tcpDirection.projectOnPlane(axis);
            targetDirection = targetDirection.projectOnPlane(axis);
            //solution[joint.name] = tcpDirection.angleTo(targetDirection);
            */
        }

        console.log(solution);
        return solution;
    }
};

export default CCDIK;
