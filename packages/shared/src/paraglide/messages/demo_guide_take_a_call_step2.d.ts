/**
* | output |
* | --- |
* | "Choose the caller's preferred contact method." |
*
* @param {Demo_Guide_Take_A_Call_Step2Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_take_a_call_step2: ((inputs?: Demo_Guide_Take_A_Call_Step2Inputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Guide_Take_A_Call_Step2Inputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Guide_Take_A_Call_Step2Inputs = {};
