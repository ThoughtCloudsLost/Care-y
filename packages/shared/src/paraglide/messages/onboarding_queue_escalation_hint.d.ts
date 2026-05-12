/**
* | output |
* | --- |
* | "Days before an unresolved {ticket} is flagged. 1 to 365." |
*
* @param {Onboarding_Queue_Escalation_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_escalation_hint: ((inputs: Onboarding_Queue_Escalation_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Queue_Escalation_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Queue_Escalation_HintInputs = {
    ticket: NonNullable<unknown>;
};
