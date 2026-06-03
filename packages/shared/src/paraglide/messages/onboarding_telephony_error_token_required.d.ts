/**
* | output |
* | --- |
* | "Auth Token is required." |
*
* @param {Onboarding_Telephony_Error_Token_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_error_token_required: ((inputs?: Onboarding_Telephony_Error_Token_RequiredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Telephony_Error_Token_RequiredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Telephony_Error_Token_RequiredInputs = {};
