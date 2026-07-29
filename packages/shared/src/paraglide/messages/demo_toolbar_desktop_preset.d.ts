/**
* | output |
* | --- |
* | "Desktop size" |
*
* @param {Demo_Toolbar_Desktop_PresetInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_desktop_preset: ((inputs?: Demo_Toolbar_Desktop_PresetInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Toolbar_Desktop_PresetInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Toolbar_Desktop_PresetInputs = {};
