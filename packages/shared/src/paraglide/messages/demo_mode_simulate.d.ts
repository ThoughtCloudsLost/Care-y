/**
* | output |
* | --- |
* | "Simulate" |
*
* @param {Demo_Mode_SimulateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_mode_simulate: ((inputs?: Demo_Mode_SimulateInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Mode_SimulateInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Mode_SimulateInputs = {};
