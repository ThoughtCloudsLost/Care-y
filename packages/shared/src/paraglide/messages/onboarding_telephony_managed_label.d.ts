/**
* | output |
* | --- |
* | "Set up telephony for me" |
*
* @param {Onboarding_Telephony_Managed_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_managed_label: ((inputs?: Onboarding_Telephony_Managed_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Telephony_Managed_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Telephony_Managed_LabelInputs = {};
