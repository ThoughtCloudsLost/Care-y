/**
* | output |
* | --- |
* | "{count} hours" |
*
* @param {Escalation_Threshold_HoursInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_threshold_hours: ((inputs: Escalation_Threshold_HoursInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Threshold_HoursInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Threshold_HoursInputs = {
    count: NonNullable<unknown>;
};
