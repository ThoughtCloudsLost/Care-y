/**
* | output |
* | --- |
* | "You can set up telephony from the admin panel at any time." |
*
* @param {Onboarding_Telephony_Skip_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_skip_description: ((inputs?: Onboarding_Telephony_Skip_DescriptionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Telephony_Skip_DescriptionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Telephony_Skip_DescriptionInputs = {};
