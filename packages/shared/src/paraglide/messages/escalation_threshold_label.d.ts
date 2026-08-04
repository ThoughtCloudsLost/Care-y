/**
* | output |
* | --- |
* | "Threshold" |
*
* @param {Escalation_Threshold_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_threshold_label: ((inputs?: Escalation_Threshold_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Threshold_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Threshold_LabelInputs = {};
