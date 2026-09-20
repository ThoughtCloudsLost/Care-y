/**
* | output |
* | --- |
* | "Continue" |
*
* @param {Onboarding_Queue_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_submit: ((inputs?: Onboarding_Queue_SubmitInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Queue_SubmitInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Queue_SubmitInputs = {};
