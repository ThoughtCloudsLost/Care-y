/**
* | output |
* | --- |
* | "Escalation Days" |
*
* @param {Onboarding_Queue_Escalation_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_escalation_label: ((inputs?: Onboarding_Queue_Escalation_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Queue_Escalation_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Queue_Escalation_LabelInputs = {};
