/**
* | output |
* | --- |
* | "Data flow" |
*
* @param {Demo_Flow_Toggle_ShortInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_toggle_short: ((inputs?: Demo_Flow_Toggle_ShortInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Toggle_ShortInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Toggle_ShortInputs = {};
