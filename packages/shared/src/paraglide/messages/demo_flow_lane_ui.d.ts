/**
* | output |
* | --- |
* | "Screen" |
*
* @param {Demo_Flow_Lane_UiInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_lane_ui: ((inputs?: Demo_Flow_Lane_UiInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Lane_UiInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Lane_UiInputs = {};
