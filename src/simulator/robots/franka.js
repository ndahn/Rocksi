const Franka = {
    path: './models/franka_description/robots/panda_arm_hand.urdf.xacro',
    
    packages: {
        franka_description: "./models/franka_description"
    },

    defaultPose: {
        panda_joint1: 0.5,
        panda_joint2: -0.3,
        panda_joint4: -1.8,
        panda_joint6: 1.5,
        panda_joint7: 1.0,
    },

    // TODO Use only for viewport interactions
    ikEnabled: [
        'panda_joint1',
        'panda_joint2',
        'panda_joint4',
//        'panda_joint5',
//        'panda_joint6',
    ],

    interactionJointLimits: {
        panda_joint4: { upper: -Math.PI / 6 },
    },


    // The model loaded by URDFLoader
    model: {},

    arm: {
        joints: [],
        movable: [],
        links: [],
    },

    hand: {
        joints: [],
        movable: [],
        links: [],
    },

    ikjoints: [],
    tcp: {},
    

    isJoint: function (part) {
        return part.type === 'URDFJoint';
    },

    isLink: function (part) {
        return part.type === 'URDFLink';
    },

    isArm: function (part) {
        return part.name.match(/(?:panda_joint\d)|(?:panda_link\d)/g);
    },

    isHand: function (part) {
        return part.name.includes('hand') || part.name.includes('finger');
    },

    isTCP: function(part) {
        return part.name === 'panda_hand';
    },

    isIKEnabled: function (part) {
        return this.ikEnabled.includes(part.name);
    },


    getJointForLink: function (link, model) {
        if (model === undefined) {
            model = this.model;
        }

        if (typeof link === 'string') {
            link = model.links[link];
        }

        if (this.isHand(link)) {
            return model.joints['panda_hand_joint'];
        }

        if (this.isFinger(link)) {
            if (joint.name.endsWith('leftfinger')) {
                return model.joints['panda_finger_joint1'];
            }
            else if (joint.name.endsWith('rightfinger')) {
                return model.joints['panda_finger_joint2'];
            }
        }

        let jointName = link.name.replace('_link', '_joint');
        return model.joints[jointName];
    },

    getLinkForJoint: function (joint, model) {
        if (model === undefined) {
            model = this.model;
        }

        if (typeof joint === 'string') {
            joint = model.joints[joint];
        }

        if (this.isHand(joint)) {
            return model.links['panda_hand'];
        }

        if (this.isFinger(joint)) {
            if (joint.name.endsWith(1)) {
                return model.links['panda_leftfinger'];
            }
            else if (joint.name.endsWith(2)) {
                return model.links['panda_rightfinger'];
            }
        }

        let linkName = joint.name.replace('_joint', '_link');
        return model.links[linkName];
    },


    init(model) {
        this.model = model;
        this.joints = model.joints;
        this.links = model.links;

        model.traverse(child => {
            if (this.isTCP(child)) {
                this.tcp = child;
            }

            if (this.isIKEnabled(child)) {
                this.ikjoints.push(child);
            }

            let obj;
            if (this.isArm(child)) {
                obj = this.arm;
            }
            else if (this.isHand(child)) {
                obj = this.hand;
            }
            else {
                return;
            }

            if (this.isJoint(child)) {
                obj.joints.push(child);
                if (child._jointType !== 'fixed') {
                    obj.movable.push(child);
                }
            }
            else if (child.type === 'URDFLink') {
                obj.links.push(child);
            }
        });
    },
};

module.exports = Franka;
