/**
* | output |
* | --- |
* | "Customize the terms your organization uses. These defaults work for most orgs." |
*
* @param {Onboarding_Org_Terminology_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_terminology_subtext: ((inputs?: Onboarding_Org_Terminology_SubtextInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Org_Terminology_SubtextInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Org_Terminology_SubtextInputs = {};
