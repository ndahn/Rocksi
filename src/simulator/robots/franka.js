const path = './models/franka_description/robots/panda_arm_hand.urdf.xacro';
const packages = { franka_description: "./models/franka_description" };

function isFinger(child) {
    return child.name.startsWith('panda_finger_joint');
};

function isTCP(child) {
    // panda_hand is child to panda_hand_joint and parent of panda_hand_finger1 and 2
    return child.name === 'panda_hand';
};

const defaultPose = {
    // panda_joint2: -0.3,
    // panda_joint4: -1.8,
    // panda_joint6: 1.5,
    // panda_joint7: 1.0,
};

export { path, packages, isFinger, isTCP, defaultPose }
