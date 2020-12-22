import { Vector3, Quaternion } from 'three'

/*
 * Cyclic Coordinate Descent
 * Inspired by https://zalo.github.io/blog/inverse-kinematics/
 */
class CCDIK {
    constructor(scene, robot) { }

    solve(robot, targetPosition) {
        const solution = {};
        robot.loadedModel.updateMatrixWorld(true);

        let tcpPosition = new Vector3();
        let deltaNormal = new Vector3();
        
        for (let i = robot.jointsOrdered.length - 1; i >= 0; i--) {
            const joint = robot.jointsOrdered[i];
            if (!robot.isArm(joint) || joint._jointType === 'fixed' || typeof joint.axis === 'undefined') {
                continue;
            }

            // Vector to the TCP and target from the joint's POV. This algorithm is iterative in the sense 
            // that we update every joint immediately to get an updated TCP position. The solution won't be 
            // perfect, so running the solver again will improve on the previous solution.
            robot.tcp.getWorldPosition(tcpPosition);
            let tcpDirection = joint.worldToLocal(tcpPosition.clone()).normalize();  
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
            
            // TODO calculate updated tcp position so that we can calculate a solution without updating the model
            // This could be done in world coordinates
            joint.setJointValue(angle);
            solution[joint.name] = angle;
        }

        console.log(solution);
        return solution;
    }
};

export default CCDIK;
