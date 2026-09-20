/**
* | output |
* | --- |
* | "A managed subaccount will be provisioned when you configure communications." |
*
* @param {Onboarding_Telephony_Managed_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_managed_description: ((inputs?: Onboarding_Telephony_Managed_DescriptionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Telephony_Managed_DescriptionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Telephony_Managed_DescriptionInputs = {};
