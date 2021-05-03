import * as Blockly from "blockly";

import ClickableTargetMutator from '../mutators/clickable_target_mutator'
import Simulation from '../../simulator/simulation'

const fieldKeys = ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW'];

Blockly.Blocks["pose"] = {
	init: function () {
		let i = 0;
		this.jsonInit({
			type: "pose",
			message0: "x %1 y %2 z %3 r %4 p %5 y %6",
			args0: [
				{
					"type": "field_number",
					"name": fieldKeys[i++],
					"value": 0,
<<<<<<< HEAD
					"precision": 0.1,
=======
					"precision": 0.1
>>>>>>> bd6d1c4 (Changed file names and added pose block)
				},
				{
					"type": "field_number",
					"name": fieldKeys[i++],
					"value": 0,
<<<<<<< HEAD
					"precision": 0.1,
=======
					"precision": 0.1
>>>>>>> bd6d1c4 (Changed file names and added pose block)
				},
				{
					"type": "field_number",
					"name": fieldKeys[i++],
					"value": 0,
<<<<<<< HEAD
					"precision": 0.1,
				},
				{
					"type": "field_angle",
					"name": fieldKeys[i++],
					"angle": 0,
                    "precision": 0.1,
				},
				{
					"type": "field_angle",
					"name": fieldKeys[i++],
					"angle": 0,
                    "precision": 0.1,
				},
				{
					"type": "field_angle",
					"name": fieldKeys[i++],
					"angle": 0,
                    "precision": 0.1
				},
			],
			inputsInline: true,
			output: "Pose",
=======
					"precision": 0.1
				},
				{
					type: "field_angle",
					name: fieldKeys[i++],
					angle: 0,
				},
				{
					type: "field_angle",
					name: fieldKeys[i++],
					angle: 0,
				},
				{
					type: "field_angle",
					name: fieldKeys[i++],
					angle: 0,
				},
			],
			inputsInline: true,
<<<<<<< HEAD
			output: "Array",
>>>>>>> bd6d1c4 (Changed file names and added pose block)
=======
			output: "Pose",
>>>>>>> 18de391 (Added a type check for the pose block. New add_sim_object block, to be consistent with the block nameing scheme. Blockly.js now does not throw an error then deleting a non sim_object_block)
			colour: "%{BKY_MOVEMENT_HEX}",
			tooltip:
				"Eine Pose im Arbeitsraum (definiert über die Endeffektorpose, d.h. Position und Orientierung)",
			helpUrl: "",
<<<<<<< HEAD

		});
		this.setMutator(new ClickableTargetMutator());
	},
    onchange:function (e) {
        var parent = this.getParent();
        if (parent != null) {
            var fieldValues = parent.getPosition();
            for (var i = 0; i < fieldValues.length; i++) {
                this.setFieldValue(fieldValues[i], fieldKeys[i]);
            }
        }
=======
		});
		this.setMutator(new ClickableTargetMutator());
	},
	onClick: function (e) {
		Simulation.getInstance(sim => {
			const pose = sim.getTaskSpacePose();
			for (let j = 0; j < 3; j++) {
				this.setFieldValue(pose[j].toFixed(1), fieldKeys[j]);
			}
			for (let j = 3; j < 6; j++) {
				let deg = pose[j] * 180.0 / Math.PI;
				this.setFieldValue(deg.toFixed(0), fieldKeys[j]);
			}
		});
>>>>>>> bd6d1c4 (Changed file names and added pose block)
	},
};


<<<<<<< HEAD

=======
>>>>>>> bd6d1c4 (Changed file names and added pose block)
Blockly.JavaScript["pose"] = function (block) {
    let ret = '["task_space", ';
    for (const key of fieldKeys) {
        ret += block.getFieldValue(key) + ', ';
    }
    ret = ret.slice(0, -1) + ']'

    return [ret, Blockly.JavaScript.ORDER_ATOMIC];
};
