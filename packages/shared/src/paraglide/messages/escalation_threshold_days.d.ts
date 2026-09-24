/**
* | output |
* | --- |
* | "{count} days" |
*
* @param {Escalation_Threshold_DaysInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_threshold_days: ((inputs: Escalation_Threshold_DaysInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Threshold_DaysInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Threshold_DaysInputs = {
    count: NonNullable<unknown>;
};
