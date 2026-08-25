/**
* | output |
* | --- |
* | "More options" |
*
* @param {Demo_More_MenuInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_more_menu: ((inputs?: Demo_More_MenuInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_More_MenuInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_More_MenuInputs = {};
