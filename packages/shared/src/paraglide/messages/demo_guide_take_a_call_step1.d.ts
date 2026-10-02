/**
* | output |
* | --- |
* | "Open the intake form and fill in the caller's name and message." |
*
* @param {Demo_Guide_Take_A_Call_Step1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_take_a_call_step1: ((inputs?: Demo_Guide_Take_A_Call_Step1Inputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Guide_Take_A_Call_Step1Inputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Guide_Take_A_Call_Step1Inputs = {};
