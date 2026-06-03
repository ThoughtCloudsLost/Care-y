/**
* | output |
* | --- |
* | "Your Twilio auth token" |
*
* @param {Onboarding_Telephony_Token_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_token_placeholder: ((inputs?: Onboarding_Telephony_Token_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Telephony_Token_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Telephony_Token_PlaceholderInputs = {};
