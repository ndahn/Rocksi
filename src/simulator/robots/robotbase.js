import { Object3D, Vector3, Quaternion, Euler, Bone } from "three";
import { traverse } from "../utils"
const path = require('path');


export const MODELS_ROOT = path.join(process.env.PUBLIC_URL || '', "/models/");
export const getPackage = (name) => path.join(MODELS_ROOT, name);


export default class Robot {
    constructor(name, packagename, xacro) {
        this.name = name;
        this._package = packagename + '/';
        this._xacro = xacro;

        // Whether to use orientation based gripping
        this.useAdvancedGripping = true;

        // This will store the model loaded by URDFLoader
        this.model = {}
        this.links = []
        this.joints = []

        // Required for find_package
        this.packages = {
            get [packagename]() {
                return getPackage(packagename); 
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
            invertOpenClose: false,
        };

        this.robotRoot = "";
        this.handRoot = "";


        /* =============================================================
         * Everything past here should be filled by the deriving classes 
         * ============================================================= */
        
        // Additional macros that will be required for loading the Xacro
        this.rosMacros = {};

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
        this.getFrame(this.tcp.parent).add(this.tcp.object);

        // Find all joints and links from the robot root up to the hand root
        this.robotRoot = this.getFrame(this.robotRoot);
        traverse(this.robotRoot, (obj) => {
            if (obj.name === this.handRoot) {
                return true;
            }

            this.partNames.arm.push(obj.name);

            if (this.isJoint(obj)) {
                this.arm.joints.push(obj);
                if (this.isMovable(obj)) {
                    this.arm.movable.push(obj);
                }
            }
            else if (this.isLink(obj)) {
                this.arm.links.push(obj);
            }
        });

        // Find all joints and links from the hand root onwards
        this.handRoot = this.getFrame(this.handRoot);
        traverse(this.handRoot, (obj) => {
            this.partNames.hand.push(obj.name);

            if (this.isJoint(obj)) {
                this.hand.joints.push(obj);
                if (this.isMovable(obj)) {
                    this.hand.movable.push(obj);
                }
            }
            else if (this.isLink(obj)) {
                this.hand.links.push(obj);
            }
        });

        for (let joint of this.hand.movable) {
            joint.states = {
                closed: this.hand.invertOpenClose ? joint.limit.upper : joint.limit.lower,
                opened: this.hand.invertOpenClose ? joint.limit.lower : joint.limit.upper,
            };
        }
    }

    onLoadComplete() {}


    get root() {
        return MODELS_ROOT;
    }

    get package() {
        return path.join(this.root, this._package);
    }

    get xacro() {
        return path.join(this.package, this._xacro);
    }


    setPose(pose) {
        if (Array.isArray(pose)) {
            if (pose.length !== this.arm.movable.length) {
                throw new Error('Array length must be equal to the number of movable joints');
            }

            for (let i = 0; i < pose.length; i++) {
                this.arm.movable[i].setJointValue(pose[i]);
            }
        }
        else if (typeof pose === 'object') {
            for (let joint of this.arm.movable) {
                let value = pose[joint.name];
                if (typeof value === 'number') {
                    joint.setJointValue(value);
                }
            }
        }
        else {
            throw new Error('Invalid pose type "' + typeof pose + '"');
        }
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
    
	getFrame(name) {
		return this.model.frames[name];
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