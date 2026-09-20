/**
* | output |
* | --- |
* | "Telephony configuration saved." |
*
* @param {Onboarding_Telephony_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_saved: ((inputs?: Onboarding_Telephony_SavedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Telephony_SavedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Telephony_SavedInputs = {};
