import { Object3D, Vector3, Quaternion, Euler, Bone } from "three";
const path = require('path');


export const MODELS_ROOT = path.join(process.env.PUBLIC_URL || '', "/models/");


export default class Robot {
    constructor(name, packagename, xacro) {
        this.name = name;
        this._package = packagename + '/';
        this._xacro = xacro;

        // This will store the model loaded by URDFLoader
        this.model = {}
        this.links = []
        this.joints = []

        // Required for find_package
        var theRobot = this;
        this.packages = {
            get [packagename]() {
                return theRobot.package;
            }
        };

        // Parts of the arm, filled by init()
        this.arm = {
            joints: [],
            movable: [],
            links: [],
        };
    
        // Parts of the hand, filled by init()
        this.hand = {
            joints: [],
            movable: [],
            links: [],
        };


        /* =============================================================
         * Everything past here should be filled by the deriving classes 
         * ============================================================= */
        
        // Additional macros that will be required for loading the Xacro
        this.rosMacros = {};

        // Descriptions of the robot in various languages
        this.info = {
            DE: '',
            EN: '',
        };

        this.modelScale = 1;

        // Names of links and joints grouped by what they belong to
        this.partNames = {
            arm: [],   // "joint_1", "joint_2", ...
            hand: [],  // "joint_1", "joint_2", ...
        }

        // Default pose of the robot
        this.defaultPose = {
            // joint_1: -0.11,
        },
        
        // Location of the handle used for moving the robot
        this.tcp = {
            parent: "",
            // Distance and euler angles from hand origin to finger tip
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            object: new Object3D(),  // Filled by init()
        };
    
        // Joint names that the robot is allowed to use for moving
        this.ikEnabled = [
            // "joint_1", "joint_2", ...
        ];
    
        // Additional joint limits
        this.interactionJointLimits = {
            // joint_1: {
            //     lower: 0.0,
            //     upper: 1.57,
            // },
        };

        // Velocities to move a joint one unit 
        // (m/s for prismatic joints, rad/s for revolute joints)
        this.maxSpeed = {
            move: 1.0,
            gripper: 0.2
        };

        // Blockly Generator instance that can convert the blockly workspace 
        // into code that can be run on the robot
        this.generator = null;
    }


    init(model) {
        this.model = model;
		this.joints = model.joints;
        this.links = model.links;
        
        this.model.scale.set(this.modelScale, this.modelScale, this.modelScale);

		this.tcp.object.position.set(...this.tcp.position);
		this.tcp.object.quaternion.multiply(
			new Quaternion().setFromEuler(
				new Euler().set(...this.tcp.rotation)
			)
        );
        this.getTCPParent().add(this.tcp.object);

		model.traverse((child) => {
			let container;
			if (this.isArm(child)) {
				container = this.arm;
			} else if (this.isHand(child)) {
				container = this.hand;
            } else {
                // Continue to traverse
				return;
			}

			if (this.isJoint(child)) {
				container.joints.push(child);
				if (this.isMovable(child)) {
					container.movable.push(child);
				}
			} else if (this.isLink(child)) {
				container.links.push(child);
			}
		});
    }


    get root() {
        return MODELS_ROOT;
    }

    get package() {
        return path.join(this.root, this._package);
    }

    get xacro() {
        return path.join(this.package, this._xacro);
    }


	isJoint(part) {
		return part.type === "URDFJoint";
	}

	isLink(part) {
		return part.type === "URDFLink";
    }
    
    isArm(part) {
        return this.partNames.arm.includes(part.name);
    }

    isHand(part) {
        return this.partNames.hand.includes(part.name);
    }

    isMovable(part) {
        return this.isJoint(part) && part._jointType !== "fixed";
    }

	isIKEnabled(part) {
        return this.ikEnabled.length > 0
            ? this.ikEnabled.includes(part.name)
            : this.isMovable(part) && this.isArm(part);
    }


    isGripperOpen() {
        return this.getGripperAbduction() >= 0.5;
    }

    getGripperAbduction() {
        if (this.hand.movable.length === 0) {
            return 0;
        }
        
        // Average abduction of all hand joints
        let abduction = 0.0;
        for (let joint of this.hand.movable) {
            let val = joint.angle;
            let upper = joint.limit.upper;
            let lower = joint.limit.lower;
            let rel = (val - lower) / (upper - lower);
            abduction += rel;
        }
        abduction /= this.hand.movable.length;
        return abduction;
    }
    

	getJointForLink(link) {
		if (typeof link === "string") {
			link = this.model.links[link];
		}

		let p = link.parent;
		while (p) {
			if (this.isJoint(p)) {
				return p;
			}
			p = p.parent;
		}

		return null;
	}

	getLinkForJoint(joint) {
		if (typeof joint === "string") {
			joint = this.model.joints[joint];
		}

		for (let c of joint.children) {
			if (this.isLink(c)) {
				return c;
			}
		}

		return null;
    }
    
	getTCPParent() {
		return this.model.frames[this.tcp.parent];
    }


    createSkeleton() {
        let pos = new Vector3();
		let parent = new Bone();
        
        let skeleton = {
            origin: this.model,
            root: parent,
            bones: [],
            tip: this.tcp.object,
        };
        
		for (let joint of this.arm.movable) {
			let link = this.getLinkForJoint(joint);
			link.getWorldPosition(pos);
			
			let bone = new Bone();
			bone.robotJoint = joint;
			parent.add(bone);
			parent.lookAt(pos);
			parent.updateMatrixWorld();  // crucial for worldToLocal!
			bone.position.copy(bone.worldToLocal(pos));
			
			skeleton.bones.push(bone);
			parent = bone;
		}

		return skeleton;
	}
}