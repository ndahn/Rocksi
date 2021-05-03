import * as Blockly from 'blockly';
import { changeSimObjectType,
         changeSimObjectPosition,
         changeSimObjectOrientation,
         getSimObject,
         getSimObjectIdx,
         getSimObjects } from "../../simulator/objects/objects";


Blockly.Blocks['add_sim_object'] = {
	init: function () {
        var thisBlock = this;
            this.jsonInit({
                type: "add_sim_object",
                message0: "Generiert einen %1 \n an Position %2",
                args0: [
                    {
                       "type": "field_dropdown",
                       "name": "OBJECT_TYPE",
                       "options": [
                       [
                           "Würfel",
                           "cube"
                       ],
                       [
                           "Zylinder",
                           "cylinder"
                       ],
                       ]
                    },
                    {
                        type: "input_value",
                        name: "POSE",
                        check: "Pose",
                    },
                ],
                inputsInline: false,
                previousStatement: null,
                nextStatement: null,
                colour: "%{BKY_OBJECT_HEX}",
                tooltip: "Ich bin kein hilfreicher Tooltip!",
                helpUrl: "www.google.com",
            });},

	onchange: function (event) {
        var thisBlock = this;
        //console.log('SimObjectBlock: ', thisBlock);
        if (event.blockId == thisBlock.id) {

        }

		if (event.name === 'OBJECT_TYPE' && event.blockId == thisBlock.id) {
			switch (event.newValue) {
    			case 'cube':
                    console.log('You are changing Block.id: ', thisBlock.id);
                    changeSimObjectType(thisBlock.id, 'cube');
					break;
                case 'cylinder':
                    console.log('You are changing Block.id: ', thisBlock.id);
                    changeSimObjectType(thisBlock.id, 'cylinder');
                    break;
                default:
    				console.error('Error: ');
			}
		}
	},
};

//Should give the simulation an name to initialize the body of the
//3D Object and starts the physics engine
Blockly.JavaScript["add_sim_object"] = function (block) {
    var idx = getSimObjectIdx(this.id);
    var code = 'simulate("createPhysicalObject", ' + idx + ');'
	return code;
};

/*
if (event.name === 'POSITION_X' && event.blockId == thisBlock.id) {
    var simObject = getSimObject(thisBlock.id);
    var fieldValue = thisBlock.getFieldValue('POSITION_X');
    if (fieldValue != simObject.position.x) {
        simObject.position.x = thisBlock.getFieldValue('POSITION_X');
        changeSimObjectPosition(simObject);
    }
}

if (event.name === 'POSITION_Y' && event.blockId == thisBlock.id) {
    var simObject = getSimObject(thisBlock.id);
    var fieldValue = thisBlock.getFieldValue('POSITION_Y');
    if (fieldValue != simObject.position.y) {
        simObject.position.y = thisBlock.getFieldValue('POSITION_Y');
        changeSimObjectPosition(simObject);
    }
}

if (event.name === 'POSITION_Z' && event.blockId == thisBlock.id) {
    var simObject = getSimObject(thisBlock.id);
    var fieldValue = thisBlock.getFieldValue('POSITION_Z');
    if (fieldValue != simObject.position.z) {
        simObject.position.z = thisBlock.getFieldValue('POSITION_Z');
        changeSimObjectPosition(simObject);
    }
}

if (event.name === 'ROT_X' && event.blockId == thisBlock.id) {
    var simObject = getSimObject(thisBlock.id);
    var fieldValue = thisBlock.getFieldValue('ROT_X');
    if (fieldValue != simObject.rotation.x) {
        simObject.rotation.x = thisBlock.getFieldValue('ROT_X');
        changeSimObjectPosition(simObject);
    }
}

if (event.name === 'ROT_Y' && event.blockId == thisBlock.id) {
    var simObject = getSimObject(thisBlock.id);
    var fieldValue = thisBlock.getFieldValue('ROT_X');
    if (fieldValue != simObject.rotation.x) {
        simObject.rotation.x = thisBlock.getFieldValue('ROT_X');
        changeSimObjectPosition(simObject);
    }
}

if (event.name === 'ROT_Z' && event.blockId == thisBlock.id) {
    var simObject = getSimObject(thisBlock.id);
    var fieldValue = thisBlock.getFieldValue('ROT_X');
    if (fieldValue != simObject.rotation.x) {
        simObject.rotation.x = thisBlock.getFieldValue('ROT_X');
        changeSimObjectPosition(simObject);
    }
} */
