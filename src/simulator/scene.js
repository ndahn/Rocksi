import {
    MathUtils,
    Vector3,
    LoaderUtils,
    Scene,
    WebGLRenderer,
    PerspectiveCamera,
    GridHelper,
    HemisphereLight,
    PointLight,
    Mesh,
    SphereBufferGeometry,
    SphereGeometry,
    Color,
    MeshBasicMaterial
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import Stats from 'three/examples/jsm/libs/stats.module'
var TWEEN = require('@tweenjs/tween.js');

import { XacroLoader } from "xacro-parser";
import URDFLoader from "urdf-loader";

import { loadCached } from "../cachedb";
import { setupIK } from "./ik";
import Simulation from "./simulation"

let container;
let stats;

let camera, scene, renderer;

let robot;
let tcp, tcptarget;
let transformControl;
let ik;

// TODO remove
let kinematicsTween;
const tweenParameters = {};

//loadCached('robots', './models/export/franka_description.zip')
//    .then(result => loadRobotModel(result))
//    .catch(error => console.error(error.message));
loadRobotModel("./models/franka_description/robots/panda_arm_hand.urdf.xacro")
	.then(robot => {
		initScene();
		ik = setupIK(scene, robot, tcptarget);
		render();
		Simulation.init(robot, render);
		//animate();
	}, reason => {
		console.error(reason);
	});


function loadRobotModel(url) {
	return new Promise((resolve, reject) => {
		const xacroLoader = new XacroLoader();
		xacroLoader.inOrder = true;
		xacroLoader.requirePrefix = true;
		xacroLoader.localProperties = true;
		xacroLoader.rospackCommands.find = (...args) => "/models/" + args;
		xacroLoader.load(
			url,
			(xml) => {
				const urdfLoader = new URDFLoader();
				urdfLoader.packages = {
					franka_description: "./models/franka_description",
				};
				urdfLoader.workingPath = LoaderUtils.extractUrlBase(url);

				robot = urdfLoader.parse(xml);
				robot.rotateX(-Math.PI / 2);  // robot is oriented in Z-direction, but three-js has Y upwards by default
				
				const jointsOrdered = [];
				const fingers = [];

				robot.traverse(child => {
					if (child.type === 'URDFJoint') {
						jointsOrdered.push(child);
					}

					if (child.name.match('panda_finger_joint')) {
						fingers.push(child);
					}

					// panda_hand is child to panda_hand_joint and parent of panda_hand_finger1 and 2
					if (child.name === 'panda_hand') {
						tcp = child;
					}
				});

				// This way we can easily identify joints by index...
				robot['jointsOrdered'] = jointsOrdered;
				// ...as well as the fingers of the gripper
				robot['fingers'] = fingers;
				resolve(robot);
			},
			(error) => {
				console.error(error);
				reject(error);
			}
		);
	});
}


function initScene() {
	container = document.getElementById("sim-canvas");

	scene = new Scene();
	scene.background = new Color(0x363b4b);

	// Camera
	camera = new PerspectiveCamera(
		45,
		container.clientWidth / container.clientHeight,
		1,
		2000
	);
	camera.position.set(8, 17, 20);
	camera.lookAt(0, 10,)

	// Grid
	const grid = new GridHelper(20, 20, 0xf0f0f0, 0x888888);
	scene.add(grid);

	// Robot
	robot.scale.set(10.0, 10.0, 10.0);
	scene.add(robot);

	// Lights
	particleLight = new Mesh(
		new SphereBufferGeometry(4, 8, 8),
		new MeshBasicMaterial({ color: 0xffffff })
	);
	//scene.add(particleLight);

	const light = new HemisphereLight(0xffeeee, 0x111122);
	scene.add(light);

	const pointLight = new PointLight(0xffffff, 0.3);
	//pointLight.castShadow = true;
	//particleLight.add(pointLight);
	//particleLight.position.set(30, 40, 30);
	pointLight.position.set(30, 40, 30);
	scene.add(pointLight);

	renderer = new WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	// Scene controls
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.damping = 0.2;
	controls.addEventListener("change", render);

	// TCP target & controls
	tcptarget = new Mesh(
		new SphereGeometry(0.5),
		new MeshBasicMaterial({ wireframe: true })
	);
	tcptarget.position.set(10, 10, 5); // TODO tcp.position
	scene.add(tcptarget);

	transformControl = new TransformControls(camera, renderer.domElement);
	transformControl.addEventListener("change", updateRobot);
	transformControl.addEventListener("dragging-changed", function (event) {
		controls.enabled = !event.value;
	});

	transformControl.attach(tcptarget);
	scene.add(transformControl);

	// Performance statistics
	stats = new Stats();
	stats.dom.removeAttribute('style');
	stats.dom.id = 'sim-stats';
	container.appendChild(stats.dom);

    setupTween();

	window.addEventListener("resize", onWindowResize, false);
	onWindowResize();
}

function onWindowResize() {
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(container.clientWidth, container.clientHeight);
}

function updateRobot() {
	if (ik) {
		ik.solve();
	}

	render();
}

function render() {
	const timer = Date.now() * 0.0001;

	//console.log(camera.position);
	//console.log(camera.rotation);

	//camera.position.x = Math.cos( timer ) * 20;
	//camera.position.y = 10;
	//camera.position.z = Math.sin( timer ) * 20;

	//camera.lookAt( 0, 5, 0 );

	//particleLight.position.x = Math.sin(timer * 4) * 3009;
	//particleLight.position.y = Math.cos(timer * 5) * 4000;
	//particleLight.position.z = Math.cos(timer * 4) * 3009;

	renderer.render(scene, camera);
}

function setupTween() {
	const duration = MathUtils.randInt(1000, 5000);
	const target = {};

	for (const j in robot.joints) {
		const joint = robot.joints[j];
		
		const old = tweenParameters[j];
		const position = old ? old : 0.0;
		tweenParameters[j] = position;

		target[j] = MathUtils.randFloat(joint.limit.lower, joint.limit.upper);
	}

	kinematicsTween = new TWEEN.Tween(tweenParameters)
		.to(target, duration)
		.easing(TWEEN.Easing.Quadratic.Out);

	kinematicsTween.onUpdate(function (object) {
		for (const j in robot.joints) {
			robot.joints[j].setJointValue(object[j]);
		}
	});

	kinematicsTween.start();

	setTimeout(setupTween, duration);
}

function animate() {
	requestAnimationFrame(animate);

	render();
	stats.update();
	//TWEEN.update();
}
