/**
* | output |
* | --- |
* | "Screen" |
*
* @param {Demo_Flow_Lane_UiInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_lane_ui: ((inputs?: Demo_Flow_Lane_UiInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Lane_UiInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Lane_UiInputs = {};
