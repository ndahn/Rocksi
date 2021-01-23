import Split from 'split.js'

// Split panes
Split(['#split-pane-1', '#split-pane-2'], {
    minSize: 0,
    snapOffset: 20,
    gutterStyle: function (dim, size, index) {
        // return an empty style, we do everything in CSS
        return {};
    }
});


// Tabs
let animDuration = 200;
let targetRatio = 50;
if (document.body.clientWidth < 768) {
    targetRatio = 100;
    $('#split-pane-2').hide();
    $('#split-pane-1').css('width', '100%');
}

$('#blocks-btn').on('click', evt => {
    let view = $('#split-pane-1');
    view.show();
    if (view.width() > 0) {
        // Shrink blocks view to 0, expand 3D view
        view.animate({ width: 0 }, animDuration);
        $('#split-pane-2').animate({ width: '100%' }, animDuration);
    } else {
        // Expand blocks view to targetRatio, 3D view will take up the rest
        view.animate({ width: targetRatio + '%' }, animDuration);
        $('#split-pane-2').animate({ width: (100 - targetRatio) + '%' }, animDuration);
    }
});

$('#viewport-btn').on('click', evt => {
    let view = $('#split-pane-2');
    view.show();
    if (view.width() > 0) {
        // Shrink 3D view to 0, expand blocks view
        view.animate({ width: 0 }, animDuration);
        $('#split-pane-1').animate({ width: '100%' }, animDuration);
    } else {
        // Expand 3D view to targetRatio, blocks view will take up the rest
        view.animate({ width: targetRatio + '%' }, animDuration);
        $('#split-pane-1').animate({ width: (100 - targetRatio) + '%' }, animDuration);
    }
});

$('#tutorial-btn').on('click', evt => {

});

$('#about-btn').on('click', evt => {
    $('#about-lightbox').show();
});
$('#about-lightbox').on('click', evt => {
    $('#about-lightbox').hide();
});


import './simulator/scene'
import './editor/blockly'