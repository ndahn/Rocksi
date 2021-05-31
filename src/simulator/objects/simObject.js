import { BoxBufferGeometry,
         MeshPhongMaterial,
         CylinderGeometry,
         Mesh,
         Vector3,
         Euler } from 'three';

import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import { requestAF,
         getScene,
         getRobot,
         getControl,
         addListeners,
         removeListeners } from '../scene';

import { getWorld } from '../physics';

import { Box,
         Vec3,
         Body,
         Material } from 'cannon-es'

export class SimObject extends Mesh {
    constructor() {
        super();
        this.name = undefined;
        this.type = 'cube';
        this.attached = false;
        this.hasBody = false;
        this.spawnPosition = new Vector3(5, 0, this.size.z * .5);
        this.spawnRotation = new Euler(0, 0, 0);
        this.body = undefined;
        this.control = undefined; //undefined...
        this._fieldValues = this._calcFieldValues();
        this.colour = '#eb4034'
    }
    size = new Vector3(.5, .5, .5);

    _calcFieldValues() {
        let fieldValues = [];
        let radValues = [];

        this.spawnPosition.toArray(fieldValues);
        fieldValues[2] = fieldValues[2] - this.size.z * .5;
        this.spawnRotation.toArray(radValues);
        //console.log('_calcFieldValues', this.spawnPosition);
        for (let i = 0; i < 3; i++) {
            let val = this._radToDeg(radValues[i]);
            fieldValues.push(parseInt(val.toFixed()));
        }


        return fieldValues;
    }

    updateFieldValues() {
        this._fieldValues = this._calcFieldValues();
    }

    _radToDeg (rad) { return rad * 180 / Math.PI; }
    _degToRad (deg) { return  deg * Math.PI / 180.0; }

    getFieldValues() {
        return this._fieldValues;
    }

    setFieldValues(fieldValues) {
        this._fieldValues = fieldValues;
    }

    _fieldValuesToPos(fieldValues) {
        let posArray = [];
        let eulArray = [];
        for (let i = 0; i < 3; i++) {
            posArray.push(fieldValues[i]);
            eulArray.push(parseFloat(this._degToRad(fieldValues[i + 3]).toFixed(3)));
        }

        for (let i = 0; i < 2; i++) {
            this.spawnPosition.setComponent(i, posArray[i]);
        }
        this.spawnPosition.setComponent(2, posArray[2] + this.size.z * .5);
        this.spawnRotation.fromArray(eulArray);
    }

    updateFromFieldValues() {
        this._fieldValuesToPos(this.fieldValues)
        this.updatePos(this.spawnPosition, this.spawnRotation);
    }

    updatePos(vector, euler)  {
        this.position.copy(vector);
        this.setRotationFromEuler(euler);
    }

    render() { requestAF(); }

    makeVisible() {
        const scene = getScene();
        scene.add(this.control);
        scene.add(this);
        this.render();
    }

    hide() {
        const scene = getScene();
        scene.remove(this.control);
        scene.remove(this);
        this.render();
    }

    createBody() {
        let body;
        if ('cube' == this.type) {
            const shape = new Box(new Vec3(0.251, 0.251, 0.251))
            body = new Body({ mass: 0.01 })
            body.addShape(shape)
        }
        body.material = new Material({ friction: 4, restitution: -1});
        body.position.set(this.position)
        body.allowSleep = true;
        body.sleepSpeedLimit = 0.2;
        body.sleepTimeLimit = 0.2;
        body.name = this.name;
        this.hasBody = true;
        this.body = body;
        this.body.sleep();
        this.updateBody();

    }

    updateBody() {
        this.body.position.copy(this.position);
        this.body.quaternion.copy(this.quaternion);
    }

    updateMesh() {
        this.position.copy(this.body.position);
        this.quaternion.copy(this.body.quaternion);
    }

    add() {
        const scene = getScene();
        this.updatePos(this.spawnPosition, this.spawnRotation)
        scene.add(this);
        this.initTransformControl();
        this.render();
    }

    //Callback for the change event
    _change() {
        //Sometimes the controls are not visible, but they will change the position/rotation.
        //this is here to counter this behaviour
        if (!this.control.visible) {
            this.position.copy(this.spawnPosition);
            this.setRotationFromEuler(this.spawnRotation);
        }
        this.render()
    }
    //callback for dragging-changed
    _draggingCanged(event) {
        const controlObj = getControl();
        controlObj.orbitControls.enabled = ! event.value;
    }
    //callback for objectChange
    _objectChange() {
        if (this.control.visible) {
            if (this.position.z < 0) { this.position.z = this.size.z * .5; }

            this.spawnPosition.copy(this.position);
            this.spawnRotation.copy(this.rotation);
            this._fieldValues = this._calcFieldValues();
        }
    }

    addTransformListeners() {
        if (this.control) {
            this.control.addEventListener('change', () => this._change());

            this.control.addEventListener('dragging-changed',(event) => this._draggingCanged(event));

            this.control.addEventListener('objectChange', () => this._objectChange());
        }
        addListeners(); //for the listeners in the scene

    }

    removeTransformListners() {
        if (this.control) {
            this.control.removeEventListener('change', () => this._change());

            this.control.removeEventListener('dragging-changed',(event) => this._draggingCanged(event));

            this.control.removeEventListener('objectChange', () => this._objectChange());
        }
        removeListeners();//for the listeners in the scene
    }

    initTransformControl() {
        const controlObj = getControl();
        const scene = getScene();

        this.control = new TransformControls(controlObj.camera, controlObj.renderer.domElement);

        this.addTransformListeners()

        this.control.attach(this);
        scene.add(this.control);

        this.control.visible = false;
    }

    addBodyToWorld() {
        const world = getWorld();
        world.addBody(this.body);
    }

    removeBodyFromWorld() {
        const world = getWorld();
        world.removeBody(this.body);
    }

    remove() {
        const scene = getScene();
        const world = getWorld();

        if (this.hasBody) { world.removeBody(this.body); }
        if (this.isAttached) { scene.attach(this) }

        this.control.visible = true; //otherwise the renderer throws an error.
                                     //I suspect that threejs removes the
                                     //controls if visible is false.
        scene.remove(this.control);
        scene.remove(this);

        this.render();
    }

    setColour(colour) {
        this.material = new MeshPhongMaterial({ color: colour });
    }

    reset() {
        if (this.hasBody) {
            const world = getWorld();
            world.removeBody(this.body);
        }
        this.position.copy(this.spawnPosition);
        this.setRotationFromEuler(this.spawnRotation);
        this.updateBody();
        this.render();
    }

    detachFromGripper() {
        const scene = getScene();
        this.attached = false;
        scene.attach(this);
        scene.add(this.control);
        this.addBodyToWorld();
        this.updateBody();
        this.body.wakeUp();
        this.body.updateInertiaWorld();
        console.log('> Object dropped!');
    }

    attachToGripper() {
        const robot = getRobot();
        const scene = getScene();
        const tcp = robot.tcp.object;
        this.attached = true;
        scene.remove(this.control);
        this.removeBodyFromWorld();
        tcp.attach(this);
        //This is important, otherwise the 3D-object will not attach correctly.
        this.updateBody();
        console.log('> Object gripped!');
    }
}
