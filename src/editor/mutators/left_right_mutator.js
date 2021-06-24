import * as Blockly from 'blockly'


const FIELD_ID_LEFT = 'LeftMutatorField';
const FIELD_ID_RIGHT = 'RightMutatorField';


// TODO Use a custom field to avoid field spacing
// See https://developers.google.com/blockly/guides/create-custom-blocks/fields/customizing-fields/extending


function createButton(iconPath, altText, tooltip) {
    let icon = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.SVG,
        {}, 
        null);
        
        // Square with rounded corners
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.RECT,
        {
            'class': 'blocklyIconShape',
            'rx': '4',
            'ry': '4',
            'height': '18',
            'width': '18',
            'fill': '#00f',
        },
        icon);
    // Circle
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.CIRCLE,
        {
            'class': 'blocklyIconSymbol',
            'r': '6',
            'cx': '9',
            'cy': '9',
            'fill': '#fff',
        },
        icon);
    // Downwards arrow
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.PATH,
        {
            'class': 'blocklyIconShape',
            'd': iconPath,
            'style': 'stroke: none;',
            'fill': '#00f',
        },
        icon);

    let icon_src = Blockly.utils.xml.domToText(icon);
    icon_src = 'data:image/svg+xml;base64,' + btoa(icon_src);

    const button = new Blockly.FieldImage(icon_src, 18, 18, altText, undefined, 
        {
            'tooltip': tooltip
        }
    );
    button.initModel = function() {
        Blockly.utils.dom.addClass(button.fieldGroup_, 'leftRightMutatorButton');
    };
    
    return button;
}

function createLeft() {
    return createButton('M 4 9 l 6 -5 v 3 h 3 v 4 h -3 v 3 Z', 
        '\u25C0', 
        'Übernehme die Werte aus der 3D-Ansicht');
}

function createRight() {
    return createButton('M 13 9 l -6 -5 v 3 h -3 v 4 h 3 v 3 Z',
        '\u25B6', 
        'Aktualisiere das Objekt in der 3D-Ansicht');
}


const LeftRightMutator = {
    // Just an empty element for parameter storage so blockly is happy and we can use the mutator
    domToMutation: function () {},
    mutationToDom: function () {
        return document.createElement('mutation');
    },

    addButtons: function() {
        if (!this.getField(FIELD_ID_LEFT)) {
            const left = createLeft();
            left.setOnClickHandler(this.left);
            this.inputList[0].appendField(left, FIELD_ID_LEFT);
        }

        if (!this.getField(FIELD_ID_RIGHT)) {
            const right = createRight();
            right.setOnClickHandler(this.right);
            this.inputList[0].appendField(right, FIELD_ID_RIGHT);
        }
    },

    left: function(e) {
        const block = this.sourceBlock_;
        if (typeof block.onLeft === 'function') {
            block.onLeft(e);
        }
    },

    right: function(e) {
        const block = this.sourceBlock_;
        if (typeof block.onRight === 'function') {
            block.onRight(e);
        }
    }
}

const leftRightHelper = function() {
    this.addButtons();
}

Blockly.Extensions.registerMutator(
    'left_right_mutator', LeftRightMutator, leftRightHelper);

export default LeftRightMutator;
