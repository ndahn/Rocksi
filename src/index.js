import Split from 'split.js'

// Split panes
Split(['#split-pane-1', '#split-pane-2'], {
    gutterStyle: function (dim, size, index) {
        // return an empty style, we do everything in CSS
        return {};
    }
});


// Tabs
let animDuration = 200;

$('#blocks-btn').on('click', evt => {
    let view = $('#split-pane-1');
    if (view.width() > 0) {
        view.animate({ width: 0 }, animDuration);
        $('#split-pane-2').animate({ width: '100%' }, animDuration);
    } else {
        // TODO if (window.matchMedia('(max-width: '))
        view.animate({ width: '50%' }, animDuration);
        $('#split-pane-2').animate({ width: '50%' }, animDuration);
    }
});

$('#viewport-btn').on('click', evt => {
    let view = $('#split-pane-2');
    if (view.width() > 0) {
        view.animate({ width: 0 }, animDuration);
        $('#split-pane-1').animate({ width: '100%' }, animDuration);
    } else {
        view.animate({ width: '50%' }, animDuration);
        $('#split-pane-1').animate({ width: '50%' }, animDuration);
    }
});


import './simulator/scene'
import './editor/blockly'