/**
* | output |
* | --- |
* | "Escalation days must be between 1 and 365." |
*
* @param {Onboarding_Queue_Error_Escalation_RangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_error_escalation_range: ((inputs?: Onboarding_Queue_Error_Escalation_RangeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Queue_Error_Escalation_RangeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Queue_Error_Escalation_RangeInputs = {};
