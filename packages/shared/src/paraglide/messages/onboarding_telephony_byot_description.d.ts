/**
* | output |
* | --- |
* | "Bring your own Twilio credentials. You manage the account and phone numbers." |
*
* @param {Onboarding_Telephony_Byot_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_byot_description: ((inputs?: Onboarding_Telephony_Byot_DescriptionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Telephony_Byot_DescriptionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Telephony_Byot_DescriptionInputs = {};
