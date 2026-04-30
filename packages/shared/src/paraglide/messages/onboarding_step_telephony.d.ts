/**
* | output |
* | --- |
* | "Telephony" |
*
* @param {Onboarding_Step_TelephonyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_telephony: ((inputs?: Onboarding_Step_TelephonyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Step_TelephonyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Step_TelephonyInputs = {};
