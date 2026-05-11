/**
* | output |
* | --- |
* | "A managed subaccount will be provisioned when you configure communications." |
*
* @param {Onboarding_Telephony_Managed_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_managed_description: ((inputs?: Onboarding_Telephony_Managed_DescriptionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Telephony_Managed_DescriptionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Telephony_Managed_DescriptionInputs = {};
