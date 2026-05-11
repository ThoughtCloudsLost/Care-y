/**
* | output |
* | --- |
* | "Basic information about your organization." |
*
* @param {Onboarding_Org_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_subtext: ((inputs?: Onboarding_Org_SubtextInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Org_SubtextInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Org_SubtextInputs = {};
