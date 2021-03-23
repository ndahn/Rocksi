import * as Blockly from 'blockly';


Blockly.Blocks["add3dbox"] = {
	init: function () {
		this.jsonInit({
			type: "add3dbox",
			message0: "Box Box Box Box",
			output: "",
			colour: "",
			tooltip:
				"Fügt ein Box-Objekt hinzu",
			helpUrl: "",
		});
	},
};

Blockly.JavaScript["add3dbox"] = function (block) {
    let shape = "box";
    let position = [2, 2, 0];
	let code = 'simulate("add3dbox", [' + position + ']);';
	return code;
};
