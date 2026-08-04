/**
* | output |
* | --- |
* | "Data flow panel" |
*
* @param {Demo_Flow_Toggle_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_toggle_label: ((inputs?: Demo_Flow_Toggle_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Toggle_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Toggle_LabelInputs = {};
