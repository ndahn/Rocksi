import * as Blockly from 'blockly/core'


export function getDesiredRobot() {
    let params = new URLSearchParams(location.search);
    return params.get('robot') || 'franka';
}

export function getDesiredLanguage() {
    let params = new URLSearchParams(location.search);
    let language = params.get('lang');

    if (!language) {
        language = 'en';
        for (let lang of navigator.languages) {
            // May include IETF language tags like en-US
            let langPrimary = lang.split('-')[0].toLowerCase();
            if (['de', 'en'].includes(langPrimary)) {
                language = langPrimary;
                break;
            }
        }
    }

    return language.toLowerCase();
}

export function localize(key, ...args) {
    return $.i18n(key, ...args);
}