/**
* | output |
* | --- |
* | "Switch to walkthrough mode" |
*
* @param {Demo_Mode_Toggle_To_WalkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_mode_toggle_to_walk: ((inputs?: Demo_Mode_Toggle_To_WalkInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Mode_Toggle_To_WalkInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Mode_Toggle_To_WalkInputs = {};
