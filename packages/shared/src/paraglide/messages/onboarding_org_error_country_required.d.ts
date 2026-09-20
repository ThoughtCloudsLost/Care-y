/**
* | output |
* | --- |
* | "Select a country code." |
*
* @param {Onboarding_Org_Error_Country_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_error_country_required: ((inputs?: Onboarding_Org_Error_Country_RequiredInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Org_Error_Country_RequiredInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Org_Error_Country_RequiredInputs = {};
