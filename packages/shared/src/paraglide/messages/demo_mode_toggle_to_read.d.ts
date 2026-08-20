/**
* | output |
* | --- |
* | "Switch to read mode" |
*
* @param {Demo_Mode_Toggle_To_ReadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_mode_toggle_to_read: ((inputs?: Demo_Mode_Toggle_To_ReadInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Mode_Toggle_To_ReadInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Mode_Toggle_To_ReadInputs = {};
