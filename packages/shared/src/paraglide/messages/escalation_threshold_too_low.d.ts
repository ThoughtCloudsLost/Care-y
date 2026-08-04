/**
* | output |
* | --- |
* | "Threshold must be at least 5 minutes." |
*
* @param {Escalation_Threshold_Too_LowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_threshold_too_low: ((inputs?: Escalation_Threshold_Too_LowInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Threshold_Too_LowInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Threshold_Too_LowInputs = {};
