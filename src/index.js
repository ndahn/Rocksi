import Split from 'split.js'
Split(['#split-pane-1', '#split-pane-2'], {
    gutterStyle: function (dim, size, index) {
        // return an empty style, we do everything in CSS
        return {};
    }
});

import './simulator/scene'
import './editor/blockly'