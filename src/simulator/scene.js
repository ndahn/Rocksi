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
    MeshBasicMaterial,
	LoadingManager
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

var ResizeSensor = require('css-element-queries/src/ResizeSensor');

import { XacroLoader } from "xacro-parser";
import URDFLoader from "urdf-loader";

import { loadCached } from "../cachedb";
import { default as IKSolver } from "./ik/ccdik"
import Simulation from "./simulation"

let params = new URLSearchParams(location.search);
const selectedRobot = params.get('robot') || 'Franka';
let robot;

switch (selectedRobot.toLowerCase()) {
	case 'franka':
		robot = require('./robots/franka');
		break;
	
	default:
		throw ('Unknown robot \'' + selectedRobot + '\'');
}

let container;
let camera, scene, renderer;

let tcptarget;
let transformControl;
let ik;

//loadCached('robots', './models/export/franka_description.zip')
//    .then(result => loadRobotModel(result))
//    .catch(error => console.error(error.message));
loadRobotModel(robot.path)
	.then(model => {
		robot.init(model);
		console.log(robot);

		initScene();
		model.rotateX(-Math.PI / 2);  // robot is oriented in Z-direction, but three-js has Y upwards by default
		
		for (const j in robot.defaultPose) {
			try {
				model.joints[j].setJointValue(robot.defaultPose[j]);
			} catch (e) {
				console.error('Failed to set default joint pose for joint ' + j + ': ' + e);
			}
		}

		ik = new IKSolver(scene, robot);
		Simulation.init(robot, ik, render);
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
				let manager = new LoadingManager(undefined, render);
				const urdfLoader = new URDFLoader(manager);
				urdfLoader.packages = robot.packages;
				urdfLoader.workingPath = LoaderUtils.extractUrlBase(url);

				let model = urdfLoader.parse(xml);
				resolve(model);
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
	robot.loadedModel.scale.set(10.0, 10.0, 10.0);
	scene.add(robot.loadedModel);

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
	renderer.sortObjects = false;
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

	let domParent = document.querySelector('.sim-container');
	new ResizeSensor(domParent, onCanvasResize);
	onCanvasResize();
}

function onCanvasResize() {
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(container.clientWidth, container.clientHeight);
	requestAnimationFrame(render);
}

function updateRobot() {
	if (ik && typeof ik.solve === 'function') {
		const solution = ik.solve(scene, robot, tcptarget.position);

		for (const j in solution) {
			robot.joints[j].setJointValue(solution[j]);
		}
	}

	requestAnimationFrame(render);
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
