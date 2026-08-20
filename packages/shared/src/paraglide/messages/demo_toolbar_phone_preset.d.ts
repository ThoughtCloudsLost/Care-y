/**
* | output |
* | --- |
* | "Phone size" |
*
* @param {Demo_Toolbar_Phone_PresetInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_phone_preset: ((inputs?: Demo_Toolbar_Phone_PresetInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Toolbar_Phone_PresetInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Toolbar_Phone_PresetInputs = {};
