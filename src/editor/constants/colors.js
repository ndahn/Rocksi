import * as Blockly from 'blockly/core'
import { Msg } from 'blockly'


// Palette: https://coolors.co/4c97ff-5cc15c-ff9f29-ff6680-7875ff
Msg.MOVEMENT_HEX = "#4c97ff";
Msg.OBJECTS_HEX = "#59c059";
Msg.LOGIC_HEX = "#ff9f29";
Msg.EXTRAS_HEX = "#ff6680";
Msg.MATH_HEX = "#7875FF";
Msg.EXAMPLES_HEX = '#888888';
Msg.STRUCTURE_HEX = '#888888';


// Reference: https://blocklycodelabs.dev/codelabs/theme-extension-identifier/index.html#0
Blockly.Themes.Rocksi = Blockly.Theme.defineTheme('rocksi', {
    'base': Blockly.Themes.Modern,
    'blockStyles': {
        'movement_blocks': {
            'colourPrimary': Msg.MOVEMENT_HEX,
        },

        'objects_blocks': {
            'colourPrimary': Msg.OBJECTS_HEX,
        },
        'colour_blocks': {
            'colourPrimary': Msg.OBJECTS_HEX,
        },

        'logic_blocks': {
            'colourPrimary': Msg.LOGIC_HEX,
        },
        'loop_blocks': {
            'colourPrimary': Msg.LOGIC_HEX,
        },

        'extras_blocks': {
            'colourPrimary': Msg.EXTRAS_HEX,
        },

        'examples_blocks': {
            'colourPrimary': Msg.EXAMPLES_HEX,
        },

        'structure_blocks': {
            'colourPrimary': Msg.STRUCTURE_HEX,
        },

        'math_blocks': {
            'colourPrimary': Msg.MATH_HEX,
        },
    },
    'categoryStyles': {
    }
});
