/**
* | output |
* | --- |
* | "No activity for" |
*
* @param {Escalation_Condition_InactiveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_condition_inactive: ((inputs?: Escalation_Condition_InactiveInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Condition_InactiveInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Condition_InactiveInputs = {};
