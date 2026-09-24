/**
* | output |
* | --- |
* | "Account SID is required." |
*
* @param {Onboarding_Telephony_Error_Sid_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_error_sid_required: ((inputs?: Onboarding_Telephony_Error_Sid_RequiredInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Telephony_Error_Sid_RequiredInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Telephony_Error_Sid_RequiredInputs = {};
