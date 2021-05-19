import { Object3D, Quaternion, Euler } from "three";
const path = require('path');

const Niryo = {
	info: {
		EN: "Niryo One",
		DE: "Niryo One",
	},

	// TODO: find a better place that can be referenced easily by all robot definitions
	root: path.join(process.env.PUBLIC_URL || '', "/models/"),

	get package() {
		return path.join(Niryo.root, "niryo_one_description/");
	},
	get xacro() {
		return path.join(Niryo.package, "urdf/v2/niryo_one.urdf.xacro");
	},

	packages: {
		get niryo_one_description() {
			return Niryo.package;
		},
	},

	defaultPose: {
		joint_1: 0.5,
		joint_2: -0.3,
		joint_4: -1.8,
		joint_6: 1.5,
		joint_7: 1.0,
	},

	// Only for viewport interactions
	ikEnabled: [
		"joint_1",
		"joint_2",
		"joint_3",
		"joint_5",
		// "joint_4",
		// "joint_6",
	],

	interactionJointLimits: {
	},

	tcp: {
		// Distance and euler angles from hand origin to finger tip
		position: [0, 0, 0.103394],
		rotation: [0, 0, 0],
		parent: "hand_tool_joint",
		object: new Object3D(),
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


	isJoint: function (part) {
		return part.type === "URDFJoint";
	},

	isLink: function (part) {
		return part.type === "URDFLink";
	},

	isArm: function (part) {
		return (part.name.match(/(?:joint_\d)/g)
			|| ['shoulder',
				'arm',
				'elbow',
				'forearm',
				'wrist',
				'hand'].includes(part.name.split('_')[0]));
	},

	isHand: function (part) {
		// TODO ROS model doesn't include any gripper
		return ['hand_tool_joint', 'tool_link'].includes(part.name);
	},

	isIKEnabled: function (part) {
		return this.ikEnabled.includes(part.name);
	},


	getJointForLink: function (link) {
		// TODO
		if (typeof link === "string") {
			link = this.model.links[link];
		}

		const name = link.name;
		if (this.isHand(link)) {
			if (name.endsWith("_hand")) {
				return this.model.joints["panda_hand_joint"];
			} else if (name.endsWith("_leftfinger")) {
				return this.model.joints["panda_finger_joint1"];
			} else if (name.endsWith("_rightfinger")) {
				return this.model.joints["panda_finger_joint2"];
			}
		}

		const jointName = name.replace("_link", "_joint");
		return this.model.joints[jointName];
	},

	getLinkForJoint: function (joint) {
		// TODO
		if (typeof joint === "string") {
			joint = this.model.joints[joint];
		}

		const name = joint.name;
		if (this.isHand(joint)) {
			if (name.endsWith("_hand_joint")) {
				return this.model.links["panda_hand"];
			} else if (name.endsWith("_finger_joint1")) {
				return this.model.links["panda_leftfinger"];
			} else if (name.endsWith("_finger_joint2")) {
				return this.model.links["panda_rightfinger"];
			}
		}

		const linkName = name.replace("_joint", "_link");
		return this.model.links[linkName];
	},

	getTCPParent: function () {
		return this.model.frames[this.tcp.parent];
    },
    

	init(model) {
		this.model = model;
		this.joints = model.joints;
		this.links = model.links;

		this.tcp.object.position.set(...this.tcp.position);
		this.tcp.object.quaternion.multiply(
			new Quaternion().setFromEuler(
				new Euler().set(...this.tcp.rotation)
			)
        );
        this.getTCPParent().add(this.tcp.object);

		model.traverse((child) => {
			if (this.isIKEnabled(child)) {
				this.ikjoints.push(child);
			}

			let obj;
			if (this.isArm(child)) {
				obj = this.arm;
			} else if (this.isHand(child)) {
				obj = this.hand;
			} else {
				return;
			}

			if (this.isJoint(child)) {
				obj.joints.push(child);
				if (child._jointType !== "fixed") {
					obj.movable.push(child);
				}
			} else if (child.type === "URDFLink") {
				obj.links.push(child);
			}
		});
	},
};

module.exports = Niryo;
