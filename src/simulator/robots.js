const Franka = {
    path: './models/franka_description/robots/panda_arm_hand.urdf.xacro',
    packages: { franka_description: "./models/franka_description" },

    isFinger: function(child) {
        return child.name.startsWith('panda_finger_joint');
    },
    
    isTCP: function(child) {
        // panda_hand is child to panda_hand_joint and parent of panda_hand_finger1 and 2
        return child.name === 'panda_hand';
    }
};


export { Franka }
