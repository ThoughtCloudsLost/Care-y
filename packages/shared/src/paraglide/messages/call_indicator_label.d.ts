/**
* | output |
* | --- |
* | "Call in progress" |
*
* @param {Call_Indicator_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const call_indicator_label: ((inputs?: Call_Indicator_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Call_Indicator_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Call_Indicator_LabelInputs = {};
