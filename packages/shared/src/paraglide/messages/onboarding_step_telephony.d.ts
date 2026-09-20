/**
* | output |
* | --- |
* | "Telephony" |
*
* @param {Onboarding_Step_TelephonyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_telephony: ((inputs?: Onboarding_Step_TelephonyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Step_TelephonyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Step_TelephonyInputs = {};
