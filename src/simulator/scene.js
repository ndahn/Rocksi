import {
    LoaderUtils,
    Scene,
    WebGLRenderer,
    PerspectiveCamera,
    GridHelper,
    HemisphereLight,
    PointLight,
    Mesh,
    SphereGeometry,
    Color,
    MeshBasicMaterial
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

import { XacroLoader } from "xacro-parser";
import URDFLoader from "urdf-loader";

import { loadCached } from "../cachedb";
import { setupIK } from "./ik";
import Simulation from "./simulation"

import * as Robots from './robots'

let params = new URLSearchParams(location.search);
const selectedRobot = params.get('robot') || 'Franka';
const robotDefs = Robots[selectedRobot];

let container;

let camera, scene, renderer;

let robot;
let tcp, tcptarget;
let transformControl;
let ik;

//loadCached('robots', './models/export/franka_description.zip')
//    .then(result => loadRobotModel(result))
//    .catch(error => console.error(error.message));
loadRobotModel(robotDefs.path)
	.then(robot => {
		initScene();
		ik = setupIK(scene, robot, tcptarget);
		render();
		Simulation.init(robot, render);
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
				urdfLoader.packages = robotDefs.packages;
				urdfLoader.workingPath = LoaderUtils.extractUrlBase(url);

				robot = urdfLoader.parse(xml);
				robot.rotateX(-Math.PI / 2);  // robot is oriented in Z-direction, but three-js has Y upwards by default
				
				const jointsOrdered = [];
				const fingers = [];

				robot.traverse(child => {
					if (child.type === 'URDFJoint') {
						jointsOrdered.push(child);
					}

					if (robotDefs.isFinger(child)) {
						fingers.push(child);
					}

					if (robotDefs.isTCP(child)) {
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
	//const timer = Date.now() * 0.0001;

	//camera.position.x = Math.cos( timer ) * 20;
	//camera.position.y = 10;
	//camera.position.z = Math.sin( timer ) * 20;

	//camera.lookAt( 0, 5, 0 );

	//particleLight.position.x = Math.sin(timer * 4) * 3009;
	//particleLight.position.y = Math.cos(timer * 5) * 4000;
	//particleLight.position.z = Math.cos(timer * 4) * 3009;

	renderer.render(scene, camera);
}
