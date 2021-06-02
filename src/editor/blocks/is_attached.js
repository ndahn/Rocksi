import * as Blockly from 'blockly';
import { isAttached } from "../../simulator/objects/objects";


Blockly.Blocks["is_attached"] = {
	init: function () {
		this.jsonInit({
			type: "is_attached",
			message0: "Gegriffen?",
			output: "Boolean",
			style: 'objects_blocks',
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
