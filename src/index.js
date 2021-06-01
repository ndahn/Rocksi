import Split from 'split.js'
import lozad from 'lozad'

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
    // If not hidden the initial expansion will not work correctly
    $('#split-pane-2').hide();
    $('#split-pane-1').css('width', '100%');
}

$('#blocks-btn').on('click', evt => {
    let view = $('#split-pane-2');
    view.show();
    if (view.width() > 0) {
        // Shrink blocks view to 0, expand 3D view
        view.animate({ width: 0 }, animDuration);
        $('#split-pane-1').animate({ width: '100%' }, animDuration);
    } else {
        // Expand blocks view to targetRatio, 3D view will take up the rest
        view.animate({ width: targetRatio + '%' }, animDuration);
        $('#split-pane-1').animate({ width: (100 - targetRatio) + '%' }, animDuration);
    }
});

$('#viewport-btn').on('click', evt => {
    let view = $('#split-pane-1');
    view.show();
    if (view.width() > 0) {
        // Shrink 3D view to 0, expand blocks view
        view.animate({ width: 0 }, animDuration);
        $('#split-pane-2').animate({ width: '100%' }, animDuration);
    } else {
        // Expand 3D view to targetRatio, blocks view will take up the rest
        view.animate({ width: targetRatio + '%' }, animDuration);
        $('#split-pane-2').animate({ width: (100 - targetRatio) + '%' }, animDuration);
    }
});


// Add prev/next buttons to each tutorial slide
let slides = $('#tutorial-container .tutorial-slide');
slides.each((idx, elem) => {
    let prev = (idx === 0) ? slides.length - 1 : idx - 1;
    let next = (idx === slides.length - 1) ? 0 : idx + 1;

    // <label for="tutorial-radio-1" class="prev"></label>
    let prevLabel = document.createElement('label');
    prevLabel.setAttribute('for', 'tutorial-radio-' + prev);
    prevLabel.classList.add('prev');

    // <label for="tutorial-radio-3" class="prev"></label>
    let nextLabel = document.createElement('label');
    nextLabel.setAttribute('for', 'tutorial-radio-' + next);
    nextLabel.classList.add('next');

    elem.appendChild(prevLabel);
    elem.appendChild(nextLabel);
});

$('#tutorial-btn').on('click', evt => {
    $('#tutorial-container').show();
});
$('#tutorial-close-btn').on('click', evt => {
    $('#tutorial-container').hide();
    $('.tutorial-slide video').each((idx, video) => {
        // Unload the video to save some resources
        video.pause();
        video.removeAttribute('src');
        video.load();
    });
});

$('#about-btn').on('click', evt => {
    $('#about-lightbox').show();
});
$('#about-lightbox').on('click', evt => {
    $('#about-lightbox').hide();
});


// Hide the first time hint on the first click anywhere
$('body').on('click.first-time-hint', evt => {
    $('#first-time-hint').hide();
    $(this).off('click.first-time-hint');
});


// Lazy loads everything with css class 'lozad', e.g. tutorial videos
const lazyObserver = lozad();
lazyObserver.observe();


// Somehow loading blockly early improves page loading
import 'blockly'
import './simulator/scene'
import './editor/blockly'