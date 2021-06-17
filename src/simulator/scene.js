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
	BufferGeometry,
	Line,
	LineBasicMaterial,
	Raycaster,
	Vector2,
	ArrowHelper
} from "three";

//Imports for managing objects and physics, Lukas
import { initCannon,
         initRobotHitboxes } from './physics';

import { setSimObjectHighlight,
         setTCSimObjectsOnClick } from './objects/createObjects';

// In ROS models Z points upwards
Object3D.DefaultUp = new Vector3(0, 0, 1);

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

var ResizeSensor = require("css-element-queries/src/ResizeSensor");

import { XacroLoader } from "xacro-parser";
import URDFLoader from "urdf-loader";

// import { loadCached } from "../cachedb";
// import makeRock from './objects/rock'
import { default as IKSolver } from "./ik/ccdik"
//import { default as IKSolver } from "./ik/fabrik"
import Simulation from "./simulation"
import * as GUI from "./gui"
import { popInfo } from "../alert"

const path = require('path');

let params = new URLSearchParams(location.search);
const selectedRobot = params.get('robot') || 'franka';
let robot;

switch (selectedRobot.toLowerCase()) {
	case 'franka':
		robot = require('./robots/franka');
		break;

	case 'niryo':
		robot = require('./robots/niryo');
		break;

	default:
		throw ('Unknown robot \'' + selectedRobot + '\'');
}


let container;
let camera, scene, renderer;
let raycaster;
let mouseXY = new Vector2();
let mouseDrag = false;

let tcptarget, groundLine;
let cameraControl, transformControl;
let ik;

const canHover = window.matchMedia('(hover: hover)').matches;

//loadCached('robots', './models/export/franka_description.zip')
//    .then(result => loadRobotModel(result))
//    .catch(error => console.error(error.message));
loadRobotModel(robot.xacro)
	.then(model => {
		robot.init(model);
		$('.robot-info').on('click', evt => popInfo(robot.info.DE))
		robot.setPose(robot.defaultPose);

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

		xacroLoader.rospackCommands.find = (...args) => {
			return path.join(robot.root, ...args);
		}

		for (let cmd in robot.rosMacros) {
			xacroLoader.rospackCommands[cmd] = robot.rosMacros[cmd];
		}

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
	camera.lookAt(0, 0, 10);

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
	scene.add(robot.model);
	// for (let joint of robot.arm.movable) {
	// 	joint.add(new ArrowHelper(new Vector3(0, 0, 1), new Vector3(), 0.3, 0x0000ff));
	// }


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
	cameraControl = new OrbitControls(camera, renderer.domElement);
	cameraControl.damping = 0.2;
	cameraControl.addEventListener("change", render);

	// TCP target & controls
	tcptarget = new Mesh(
		new SphereGeometry(2),
		new MeshBasicMaterial({
			visible: false
		})
	);
	robot.tcp.object.getWorldPosition(tcptarget.position);
	scene.add(tcptarget);

	let lineVertices = [];
	lineVertices.push(tcptarget.position.clone());
	lineVertices.push(tcptarget.position.clone().setZ(0));
	let lineGeometry = new BufferGeometry().setFromPoints(lineVertices);
	groundLine = new Line(lineGeometry, new LineBasicMaterial({
		color: 0xaaaacc,
	}));
	groundLine.name = 'groundLine';
	scene.add(groundLine);

	transformControl = new TransformControls(camera, renderer.domElement);
	transformControl.setSize(1.7);
	transformControl.addEventListener("change", evt => requestAnimationFrame(render));
	transformControl.addEventListener("objectChange", onTargetChange);
	transformControl.addEventListener("dragging-changed", evt => cameraControl.enabled = !evt.value);

	// TODO setMode('rotate') on click event
	transformControl.attach(tcptarget);
	scene.add(transformControl);

	if (canHover) {
		transformControl.visible = false;
        raycaster = new Raycaster();
		/*container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('click', onClick);
        replaced by: addListeners()*/
        addListeners();
	}

	let domParent = document.querySelector('.sim-container');
	new ResizeSensor(domParent, onCanvasResize);
	onCanvasResize();

	GUI.initGui(robot, cameraControl, ikRender);
}

function onCanvasResize() {
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(container.clientWidth, container.clientHeight);
	requestAnimationFrame(render);
}

function onMouseMove(evt) {
	evt.preventDefault();

	if (evt.movementX > 1 || evt.movementY > 1) {
		mouseDrag = true;
	}
	
	mouseXY.x = (evt.offsetX / container.clientWidth) * 2 - 1;
	mouseXY.y = -(evt.offsetY / container.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouseXY, camera);
    const intersections = raycaster.intersectObjects([tcptarget]);
    setSimObjectHighlight(raycaster); //does this for all TransformControls of simObjects
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
		robot,
		robot.ikEnabled,
		{
			iterations: 3,
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
	const position = geom.attributes.position;
	position.setXYZ(0, tcptarget.position.x, tcptarget.position.y, tcptarget.position.z);
	position.setXYZ(1, tcptarget.position.x, tcptarget.position.y, 0);
	position.needsUpdate = true;
}

function render() {
    renderer.render(scene, camera);
	GUI.onRobotMoved(robot);
}

//functions for simObject stuff, Lukas
export function removeListeners() {
    if (container != undefined) {
        container.removeEventListener('pointermove', onMouseMove);
		container.removeEventListener('pointerdown', onMouseDown);
        container.removeEventListener('pointerup', onMouseUp); //Only used for TransformControls for simObjects, Lukas
    }
}

export function addListeners() {
    if (container != undefined) {
        container.addEventListener('pointermove', onMouseMove);
		container.addEventListener('pointerdown', onMouseDown);
        container.addEventListener('pointerup', onMouseUp); //Only used for TransformControls for simObjects, Lukas
    }
}

function onMouseDown() {
	mouseDrag = false;
}

function onMouseUp() {
	if (mouseDrag) {
		return;
	}
    setTCSimObjectsOnClick(raycaster);
}

export function requestAF () { requestAnimationFrame(render); }

export function getScene () { return scene; }

export function getRobot () { return robot; }

export function getControl () {
    const contObj = {
        camera: camera,
        orbitControls: cameraControl,
        renderer: renderer,
    }
    return contObj;
}
