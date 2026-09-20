/**
* | output |
* | --- |
* | "Simulate" |
*
* @param {Demo_Mode_SimulateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_mode_simulate: ((inputs?: Demo_Mode_SimulateInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Mode_SimulateInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Mode_SimulateInputs = {};
