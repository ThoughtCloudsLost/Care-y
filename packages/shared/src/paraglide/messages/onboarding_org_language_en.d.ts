/**
* | output |
* | --- |
* | "English" |
*
* @param {Onboarding_Org_Language_EnInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_language_en: ((inputs?: Onboarding_Org_Language_EnInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Org_Language_EnInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Org_Language_EnInputs = {};
