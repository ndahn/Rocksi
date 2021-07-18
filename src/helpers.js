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

const _isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
export function isMobile() {
    return _isMobile;
}

const _canHover = window.matchMedia('(hover: hover)').matches;
export function canHover() {
    return _canHover;
}

export function localize(key, ...args) {
    return $.i18n(key, ...args);
}