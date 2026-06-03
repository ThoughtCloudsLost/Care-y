/**
* | output |
* | --- |
* | "Save Telephony Choice" |
*
* @param {Onboarding_Telephony_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_submit: ((inputs?: Onboarding_Telephony_SubmitInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Telephony_SubmitInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Telephony_SubmitInputs = {};
