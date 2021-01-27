import { Object3D, Quaternion, Euler } from "three";
const path = require('path');

const Franka = {
	info: {
		EN: "Franka Emika's robot features 7 joint degrees of freedem as well as a high degree " + 
				"of sensitivity. This allows it to move similar to a human arm and react to even " + 
				"light touches. The model can be found on their " +
				"<a href=\"https://github.com/frankaemika/franka_ros\" target=\"_blank\">GitHub page</a>.",
		DE: "Der Roboter von Franka Emika zeichnet sich durch 7 Gelenkfreiheitsgrade und einen " +
				"hohen Grad von Feingefühl aus. Dadurch kann sich Franka ähnlich wie der menschliche " +
				"Arm bewegen und auch auf leichte Berührungen reagieren. Das Modell stammt von Frankas " +
				"<a href=\"https://github.com/frankaemika/franka_ros\" target=\"_blank\">GitHub Seite</a>.",
	},

	// TODO: find a better place that can be referenced easily by all robot definitions
	root: path.join(process.env.PUBLIC_URL || '', "/models/"),

	get package() {
		return path.join(Franka.root, "franka_description/");
	},
	get xacro() {
		return path.join(Franka.package, "robots/panda_arm_hand.urdf.xacro");
	},

	packages: {
		get franka_description() {
			return Franka.package;
		},
	},

	defaultPose: {
		panda_joint1: 0.5,
		panda_joint2: -0.3,
		panda_joint4: -1.8,
		panda_joint6: 1.5,
		panda_joint7: 1.0,
	},

	// Only for viewport interactions
	ikEnabled: [
		"panda_joint1",
		"panda_joint2",
		"panda_joint4",
		// 'panda_joint5',
		// 'panda_joint6',
	],

	interactionJointLimits: {
		panda_joint4: { upper: -Math.PI / 6 },
	},

	tcp: {
		// Distance and euler angles from hand origin to finger tip
		position: [0, 0, 0.103394],
		rotation: [0, 0, 0],
		parent: "panda_hand",
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
		return part.name.match(/(?:panda_joint\d)|(?:panda_link\d)/g);
	},

	isHand: function (part) {
		return part.name.includes("hand") || part.name.includes("finger");
	},

	isIKEnabled: function (part) {
		return this.ikEnabled.includes(part.name);
	},


	getJointForLink: function (link) {
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

module.exports = Franka;
