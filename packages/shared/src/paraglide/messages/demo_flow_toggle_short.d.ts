/**
* | output |
* | --- |
* | "Data flow" |
*
* @param {Demo_Flow_Toggle_ShortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_toggle_short: ((inputs?: Demo_Flow_Toggle_ShortInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Toggle_ShortInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Toggle_ShortInputs = {};
