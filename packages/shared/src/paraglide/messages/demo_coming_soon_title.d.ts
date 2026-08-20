/**
* | output |
* | --- |
* | "Coming soon" |
*
* @param {Demo_Coming_Soon_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_coming_soon_title: ((inputs?: Demo_Coming_Soon_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Coming_Soon_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Coming_Soon_TitleInputs = {};
