import {
	Object3D,
	Vector3,
    Scene,
	LoaderUtils,
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
	Raycaster,
	Vector2,
    Sphere,
    Box3,
} from "three";

//Imports for managing objects and physics, Lukas
import { initCannon,
         initRobotHitboxes } from './physics';

import { initTcSimObjects } from './objects/objects';

// In ROS models Z points upwards
Object3D.DefaultUp = new Vector3(0, 0, 1);

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

var ResizeSensor = require('css-element-queries/src/ResizeSensor');

import { XacroLoader } from "xacro-parser";
import URDFLoader from "urdf-loader";

// import { loadCached } from "../cachedb";
// import makeRock from './objects/rock'
import { default as IKSolver } from "./ik/ccdik"
import Simulation from "./simulation"
import { popInfo } from '../alert'

const path = require('path');

let params = new URLSearchParams(location.search);
const selectedRobot = params.get('robot') || 'franka';
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
let raycaster;
let mouseXY = new Vector2();

let tcptarget, groundLine;
let transformControl, controls; //I need them for the simObjects. They need to be disabled when moving a simObject.
let ik;

const canHover = window.matchMedia('(hover: hover)').matches;

//loadCached('robots', './models/export/franka_description.zip')
//    .then(result => loadRobotModel(result))
//    .catch(error => console.error(error.message));
loadRobotModel(robot.xacro)
	.then(model => {
		robot.init(model);
		$('.robot-info').on('click', evt => popInfo(robot.info.DE))

		for (const j in robot.defaultPose) {
			try {
				model.joints[j].setJointValue(robot.defaultPose[j]);
			} catch (e) {
				console.error('Failed to set default joint pose for joint ' + j + ': ' + e);
			}
		}

		initScene();
        //Lukas
        initCannon();
        //initRobotHitboxes(robot); Not working... Lukas
		$('.loading-message').hide();

		ik = new IKSolver(scene, robot);
		Simulation.init(robot, ik, ikRender);
	}, reason => {
		console.error(reason);
	});


function loadRobotModel(url) {
	return new Promise((resolve, reject) => {
		const xacroLoader = new XacroLoader();
		xacroLoader.inOrder = true;
		xacroLoader.requirePrefix = true;
		xacroLoader.localProperties = true;
		xacroLoader.rospackCommands.find = (...args) => path.join(robot.root, ...args);
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

	// for (let i = 0; i < 5; i++) {
	// 	let rock = makeRock(20, 1);
	// 	rock.position.set(i * 3, 5, 0);
	// 	scene.add(rock);
	// }

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
	controls = new OrbitControls(camera, renderer.domElement);
	controls.damping = 0.2;
	controls.addEventListener("change", render);

	// TCP target & controls
	tcptarget = new Mesh(
		new SphereGeometry(2),
		new MeshBasicMaterial({
			visible: false
		})
	);
	robot.tcp.object.getWorldPosition(tcptarget.position);
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
	transformControl.setSize(1.7);
	transformControl.addEventListener("change", evt => requestAnimationFrame(render));
	transformControl.addEventListener("objectChange", onTargetChange);
	transformControl.addEventListener("dragging-changed", evt => controls.enabled = !evt.value);

	// TODO setMode('rotate') on click event
	transformControl.attach(tcptarget);
	scene.add(transformControl);

	if (canHover) {
		transformControl.visible = false;
		raycaster = new Raycaster();
		container.addEventListener('mousemove', onMouseMove);
	}

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

function onMouseMove(evt) {
	evt.preventDefault();
	mouseXY.x = (evt.offsetX / container.clientWidth) * 2 - 1;
	mouseXY.y = -(evt.offsetY / container.clientHeight) * 2 + 1;

	raycaster.setFromCamera(mouseXY, camera);
	const intersections = raycaster.intersectObjects([tcptarget]);
	let showTC = intersections.length > 0;

	if (showTC !== transformControl.visible) {
		transformControl.visible = showTC;
		requestAnimationFrame(render);
	}
}

function onTargetChange() {
	// Prevent target from going beneath the floor
	tcptarget.position.z = Math.max(0, tcptarget.position.z);
	updateGroundLine();

	// Do the IK if the target has been moved
	ik.solve(
		tcptarget,
		robot.tcp.object,
		robot.ikjoints,
		{
			iterations: 1,
			jointLimits: robot.interactionJointLimits,
			apply: true
		}
	);

	// requestAnimationFrame is called in the transformControl's change-listener,
	// so we can skip it here
}

function ikRender() {
	robot.tcp.object.getWorldPosition(tcptarget.position);
	robot.tcp.object.getWorldQuaternion(tcptarget.quaternion);
	updateGroundLine();
	requestAnimationFrame(render);
}

function updateGroundLine() {
	const geom = groundLine.geometry;
	const tcpPositionGround = geom.vertices[geom.vertices.length - 1];
	tcpPositionGround.copy(tcptarget.position);
	tcpPositionGround.z = 0;
	geom.verticesNeedUpdate = true;
}

function render() {
    renderer.render(scene, camera);
}

//Wrapper functions, Lukas

export function requestAF () { requestAnimationFrame(render); }

export function getScene () { return scene; }

export function getRobot () { return robot; }

export function getControl () {
    const contObj = {
        camera: camera,
        orbitControls: controls,
        renderer: renderer,
    }
    return contObj;
}
