/**
* | output |
* | --- |
* | "I have a Twilio account" |
*
* @param {Onboarding_Telephony_Byot_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_byot_label: ((inputs?: Onboarding_Telephony_Byot_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Telephony_Byot_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Telephony_Byot_LabelInputs = {};
