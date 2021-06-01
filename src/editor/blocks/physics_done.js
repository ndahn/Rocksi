import * as Blockly from 'blockly';
import  Simulation from "../../simulator/simulation";


Blockly.Blocks["physics_done"] = {
	init: function () {
		this.jsonInit({
			type: "physics_done",
			message0: "Ist die Physiksimulation abgeschlossen?",
			output: "Boolean",
			style: 'objects_blocks',
			tooltip:
				"Ist die Physiksimulation abgeschlossen?",
			helpUrl: "",
		});
    }
}

Blockly.JavaScript["physics_done"] = function (block) {
    let physicsDone;
    Simulation.getInstance(sim => {
        physicsDone = sim.getPhysicsDone();
    }); //simulation.instance benutzen
    let ret = '["physics_done", ' + physicsDone + ']';
    console.log(ret);
    return [ret, Blockly.JavaScript.ORDER_ATOMIC];
};
