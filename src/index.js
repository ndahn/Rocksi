import Split from 'split.js'
import lozad from 'lozad'
import * as html_de from './i18n/html_de.json'
import * as html_en from './i18n/html_en.json'


// Localize the page
jQuery(document).ready(function() {
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

    let lang = getDesiredLanguage();
    $.i18n().locale = lang;
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
$('#about-lightbox').on('click', evt => {
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


// Somehow loading blockly early improves page loading
import 'blockly'
import './simulator/scene'
import './editor/blockly'
import { getDesiredLanguage } from './helpers';
