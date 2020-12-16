import * as Blockly from 'blockly'


const ClickableTargetMutator = function(quarkNames) {
    ClickableTargetMutator.superClass_.constructor.call(this, null);
};
Blockly.utils.object.inherits(ClickableTargetMutator, Blockly.Mutator);


ClickableTargetMutator.prototype.iconClick_ = function (e) {
    const block = this.block_;
    if (typeof block.onClick === 'function') {
        block.onClick(e);
    }
}

ClickableTargetMutator.prototype.drawIcon_ = function (group) {
    // Square with rounded corners
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.RECT,
        {
            'class': 'blocklyIconShape',
            'rx': '4',
            'ry': '4',
            'height': '18',
            'width': '18',
        },
        group);
    // Circle
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.CIRCLE,
        {
            'class': 'blocklyIconSymbol',
            'r': '6',
            'cx': '9',
            'cy': '9',
            'fill': 'none',
        },
        group);
    // Target lines
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.LINE,
        {
            'class': 'blocklyIconShape',
            'x1': '1',
            'x2': '7',
            'y1': '9',
            'y2': '9',
            'style': 'stroke: black;',
        },
        group);
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.LINE,
        {
            'class': 'blocklyIconShape',
            'x1': '10',
            'x2': '17',
            'y1': '9',
            'y2': '9',
            'style': 'stroke: black;',
        },
        group);
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.LINE,
        {
            'class': 'blocklyIconShape',
            'x1': '9',
            'x2': '9',
            'y1': '1',
            'y2': '7',
            'style': 'stroke: black;',
        },
        group);
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.LINE,
        {
            'class': 'blocklyIconShape',
            'x1': '9',
            'x2': '9',
            'y1': '10',
            'y2': '17',
            'style': 'stroke: black;',
        },
        group);
}

// Just an empty element for parameter storage so blockly is happy and we can use the mutator
ClickableTargetMutator.prototype.mutationToDom = function () {
    return document.createElement('mutation');
}

ClickableTargetMutator.prototype.domToMutation = function () { }


export default ClickableTargetMutator;
