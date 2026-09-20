/**
* | output |
* | --- |
* | "{count} hours" |
*
* @param {Escalation_Threshold_HoursInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_threshold_hours: ((inputs: Escalation_Threshold_HoursInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Threshold_HoursInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Threshold_HoursInputs = {
    count: NonNullable<unknown>;
};
