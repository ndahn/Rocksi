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
    // Downwards arrow
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.PATH,
        {
            'class': 'blocklyIconShape',
            'd': 'M 7 4 v 5 h -3 l 5 6 l 5 -6 h -3 v -6 Z',
        },
        group);
}

// Just an empty element for parameter storage so blockly is happy and we can use the mutator
ClickableTargetMutator.prototype.mutationToDom = function () {
    return document.createElement('mutation');
}

ClickableTargetMutator.prototype.domToMutation = function () { }


export default ClickableTargetMutator;
