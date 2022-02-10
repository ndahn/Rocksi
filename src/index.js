import Split from 'split.js'
import lozad from 'lozad'
import * as GUI from './simulator/gui'
import { getDesiredLanguage, isTouch, isNarrowScreen, localize } from './helpers';
import * as html_de from './i18n/html_de.json'
import * as html_en from './i18n/html_en.json'


// Initialize localization so it's immediately available
$.extend($.i18n.parser.emitter, {
    link: function(nodes) {
        let target = nodes[2] || "_blank";
        // requires the data-i18n tag to start with [html]
        return '<a href="' + nodes[1] + '" target ="' + target + '">' + nodes[0] + '</a>';
    }
});

$.i18n().load({
    'en': html_en,
    'de': html_de,
});

const lang = getDesiredLanguage();
$.i18n().locale = lang;


// Localize the page
jQuery(document).ready(function() {
    $('body').i18n();

    $('.i18n-only').hide();
    $('.i18n-only.' + lang).show();
    
    // In some caces localizations are saved as external resources
    let loadExternal = document.querySelectorAll('[load-i18n]');
    for (let i = loadExternal.length; i--;) {
        let elem = loadExternal[i];
        let key = elem.getAttribute('load-i18n');
        let val = $.i18n(key);

        $(elem).load(val, function (res, status, xhr) {
            if (status == 'error') {
                $(elem).append('Error: ' + xhr.status + ':: ' + xhr.statusText);
            }
        });
    }
});


// Accordion handlers
let accordions = document.getElementsByClassName("accordion");

function setAccordionVisible(accordion, visible) {
    let panel = document.querySelector(accordion.getAttribute('panel'));
    if (visible) {
        // Calculate available space taking into account any already open active panels
        let maxHeight = Math.min(window.outerHeight, document.documentElement.clientHeight) - 60;
        maxHeight += $(panel.parentNode).find('.accordion-panel.active').height() || 0;

        // Subtract the height of all siblings of this node's parents
        let sibling = panel.parentNode.parentNode.firstElementChild;
        do {
            maxHeight -= sibling.offsetHeight;
        } while (sibling = sibling.nextElementSibling);
        maxHeight = Math.min(maxHeight, panel.scrollHeight);

        accordion.classList.add('active')
        panel.classList.add('active');
        panel.style.maxHeight = maxHeight + 'px';
    } else {
        accordion.classList.remove('active')
        panel.classList.remove('active');
        panel.style.maxHeight = null;
    }
}

for (let i = 0; i < accordions.length; i++) {
    accordions[i].addEventListener("click", function(event) {
        event.stopPropagation();
        let show = !this.classList.contains('active');

        // Show the revealed panel first so that it can take already open panels into account 
        // before they become animated.
        setAccordionVisible(this, show);
        for (let acc of accordions) {
            if (acc !== this) {
                setAccordionVisible(acc, false);
            }
        }
    });
}


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

function getSplitpaneRatio() {
    return isNarrowScreen() ? 100 : 50;
}

// On narrow screens show a full pane
if (isNarrowScreen()) {
    // If not hidden the initial expansion will not work correctly
    $('#split-pane-1').hide();
    $('#split-pane-2').css('width', '100%');
}

$('#blocks-btn').on('click', evt => {
    let view = $('#split-pane-2');
    if (view.width() > 0) {
        // Shrink blocks view to 0, expand 3D view
        view.animate({ width: 0 }, animDuration);
        $('#split-pane-1').show().animate({ width: '100%' }, animDuration);
        // GUI.hide();
    } else {
        // Expand blocks view to targetRatio, 3D view will take up the rest
        let targetRatio = getSplitpaneRatio();
        view.animate({ width: targetRatio + '%' }, animDuration);
        $('#split-pane-1').animate({ width: (100 - targetRatio) + '%' }, animDuration);
        // GUI.show();
    }
});

$('#viewport-btn').on('click', evt => {
    let view = $('#split-pane-1');
    if (view.width() > 0) {
        // Shrink 3D view to 0, expand blocks view
        view.animate({ width: 0 }, animDuration);
        $('#split-pane-2').show().animate({ width: '100%' }, animDuration);
        // GUI.show();
    } else {
        // Expand 3D view to targetRatio, blocks view will take up the rest
        let targetRatio = getSplitpaneRatio();
        view.animate({ width: targetRatio + '%' }, animDuration);
        $('#split-pane-2').animate({ width: (100 - targetRatio) + '%' }, animDuration);
        // GUI.hide();
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
    $('#robot-gui').hide();
});
$('#tutorial-close-btn').on('click', evt => {
    $('#tutorial-container').hide();
    $('#robot-gui').show();
    $('.tutorial-slide video').each((idx, video) => {
        // Unload the video to save some resources
        video.pause();
        video.removeAttribute('src');
        video.load();
    });
});


$('#about-btn').on('click', evt => {
    $('#robot-gui').hide();
    $('#about-lightbox').show();
});
$('#about-lightbox').click(function (evt) {
    // Only react to clicks outside #about-box
    let box = $('#about-box');
    if (box.is(evt.target) || box.has(evt.target).length > 0) {
        return;
    }

    let about = $('#about-lightbox');
    about.hide();
    $('#robot-gui').show();

    // Close all about section accordions
    for (let acc of accordions) {
        if (about.find(acc).length) {
            setAccordionVisible(acc, false);
        }
    }
});


// Hide the first time hint on the first click anywhere
$('body').on('click.first-time-hint', evt => {
    $('#first-time-hint').hide();
    $(this).off('click.first-time-hint');
});


// Lazy loads everything with css class 'lozad', e.g. tutorial videos
const lazyObserver = lozad();
lazyObserver.observe();


// Warn user before navigating away
window.onbeforeunload = function() {
    return localize('warn-unsaved');
}


// Hide our URL hint if we are not inside an iframe
try { 
    // Will fail because of cross origin access if we're inside an iframe - in that 
    // case we want the message to stay
    if (document.location.hostname == window.parent.location.hostname) {
        $('#iframe-notice').hide();
    }
} 
catch (e)
{}


// Somehow loading blockly early improves page loading
import 'blockly'
import './blockly_fixes'
import './simulator/scene'
import './editor/blockly'

