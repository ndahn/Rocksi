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

    // The model loaded by URDFLoader
    loadedModel: {},

    // Aliases to properties of the loadedModel for convenience
    joints: {},
    links: {},
    frames: {},
    
    // Access to joints and links in a defined order
    jointsOrdered: [],
    linksOrdered: [],

    // Various parts of the robot
    arm: [],
    hand: [],
    fingers: [],
    tcp: {},
    
    isJoint: function (part) {
        return part.name.includes('_joint');
    },

    isLink: function (part) {
        return !this.isJoint(part);
    },

    isArm: function (part) {
        return part.name.match(/(?:panda_joint\d)|(?:panda_link\d)/g);
    },

    isHand: function (part) {
        return part.name.includes('hand');
    },

    isFinger: function(part) {
        return part.name.includes('finger');
    },

    isTCP: function(part) {
        return part.name === 'panda_hand';
    },

    getJointForLink: function (link, model) {
        if (model === undefined) {
            model = this.loadedModel;
        }

        if (typeof link === 'string') {
            link = model.links[link];
        }

        if (this.isHand(link)) {
            return model['panda_hand_joint'];
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
            model = this.loadedModel;
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

    init(loadedModel) {
        this.loadedModel = loadedModel;
        this.joints = loadedModel.joints;
        this.links = loadedModel.links;
        this.frames = loadedModel.frames;

        loadedModel.traverse(child => {
            if (child.type === 'URDFJoint') {
                this.jointsOrdered.push(child);
            }
            else if (child.type === 'URDFLink') {
                this.linksOrdered.push(child);
            }
            else {
                // E.g. URDFVisual
                return;
            }

            if (this.isArm(child)) {
                this.arm.push(child);
            }
            else if (this.isHand(child)) {
                this.hand.push(child);
            }
            else if (this.isFinger(child)) {
                this.fingers.push(child);
            }
            
            if (this.isTCP(child)) {
                this.tcp = child;
            }
        });
    },
};

module.exports = Franka;
