import * as Blockly from 'blockly';
import { isAttached } from "../../simulator/objects/objects";


Blockly.Blocks["is_attached"] = {
	init: function () {
		this.jsonInit({
			type: "is_attached",
			message0: "Gegriffen?",
			output: "Boolean",
<<<<<<< HEAD
			style: 'objects_blocks',
=======
			colour: "%{BKY_SIM_OBJECTS_HEX}",
>>>>>>> 974c96b (Added a block that gives a boolean value of gripper status. Fixed a faulty function call in attachToGripper method of the simObject)
			tooltip:
				"Gibt Wahr zurück wenn der Roboter etwas gegriffen hat",
			helpUrl: "",
		});
    }
}

Blockly.JavaScript["is_attached"] = function (block) {
    let ret = '["is_attached", ' + isAttached() + ']';
    console.log(ret);
    return [ret, Blockly.JavaScript.ORDER_ATOMIC];
};
