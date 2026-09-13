/**
* | output |
* | --- |
* | "Unassigned for" |
*
* @param {Escalation_Condition_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_condition_unassigned: ((inputs?: Escalation_Condition_UnassignedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Condition_UnassignedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Condition_UnassignedInputs = {};
