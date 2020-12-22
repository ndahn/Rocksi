import {
	Object3D,
	LoaderUtils,
    Scene,
    WebGLRenderer,
	PerspectiveCamera,
	GridHelper,
    PolarGridHelper,
    HemisphereLight,
    PointLight,
    Mesh,
    SphereGeometry,
    Color,
    MeshBasicMaterial,
	LoadingManager,
	Geometry,
	Line,
	LineBasicMaterial,
	Vector3,
} from "three";

// In ROS models Z points upwards
Object3D.DefaultUp = new Vector3(0, 0, 1);

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

let tcptarget, groundLine;
let transformControl;
let ik;

//loadCached('robots', './models/export/franka_description.zip')
//    .then(result => loadRobotModel(result))
//    .catch(error => console.error(error.message));
loadRobotModel(robot.path)
	.then(model => {
		robot.init(model);
		console.log(robot);

		for (const j in robot.defaultPose) {
			try {
				model.joints[j].setJointValue(robot.defaultPose[j]);
			} catch (e) {
				console.error('Failed to set default joint pose for joint ' + j + ': ' + e);
			}
		}

		initScene();
		
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
	camera.position.set(8, 20, 17);
	camera.lookAt(0, 0, 10)

	// Grid
	//const grid = new PolarGridHelper(12, 16, 8, 64, 0x888888, 0xaaaaaa);
	const grid = new GridHelper(20, 20, 0xf0f0f0, 0x888888);
	grid.rotateX(Math.PI / 2);
	scene.add(grid);

	// Robot
	robot.model.scale.set(10.0, 10.0, 10.0);
	scene.add(robot.model);

	// Lights
	const light = new HemisphereLight(0xffeeee, 0x111122);
	scene.add(light);

	const pointLight = new PointLight(0xffffff, 0.3);
	//pointLight.castShadow = true;
	//particleLight.add(pointLight);
	//particleLight.position.set(30, 40, 30);
	pointLight.position.set(30, 30, 40);
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
		new SphereGeometry(0.01),
		new MeshBasicMaterial()
	);
	robot.tcp.getWorldPosition(tcptarget.position);
	scene.add(tcptarget);

	let lineGeometry = new Geometry();
	lineGeometry.vertices.push(tcptarget.position);
	let tcpPositionGround = tcptarget.position.clone();
	tcpPositionGround.z = 0;
	lineGeometry.vertices.push(tcpPositionGround);
	groundLine = new Line(lineGeometry, new LineBasicMaterial({
		color: 0xaaaacc,
	}));
	groundLine.name = 'groundLine';
	scene.add(groundLine);

	transformControl = new TransformControls(camera, renderer.domElement);
	transformControl.addEventListener("change", onTargetChange);
	transformControl.addEventListener("dragging-changed", function (event) {
		controls.enabled = !event.value;
	});
	// TODO setMode('rotate') on click event
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

function onTargetChange() {
	// Prevent target from going beneath the floor
	tcptarget.position.z = Math.max(0, tcptarget.position.z);
	
	// Update the ground line's end point
	const geom = groundLine.geometry;
	const tcpPositionGround = geom.vertices[geom.vertices.length - 1];
	tcpPositionGround.copy(tcptarget.position);
	tcpPositionGround.z = 0;
	geom.verticesNeedUpdate = true;

	// Do the IK if the target has been moved 
	// TODO do this ONLY when it moved
	if (ik && typeof ik.solve === 'function') {
		const solution = ik.solve(
			tcptarget,
			robot.tcp,
			robot.ikjoints,
			robot.interactionJointLimits
		);

		// TODO For now the IK solver applies the updates directly
		// for (const j in solution) {
		// 	robot.joints[j].setJointValue(solution[j]);
		// }

		requestAnimationFrame(render);
	}
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
