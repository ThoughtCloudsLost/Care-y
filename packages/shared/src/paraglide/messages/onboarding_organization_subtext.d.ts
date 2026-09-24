/**
* | output |
* | --- |
* | "Set up your organization's identity, branding, terminology, and policies. Only the organization name is required. Everything else can be configured later." |
*
* @param {Onboarding_Organization_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_organization_subtext: ((inputs?: Onboarding_Organization_SubtextInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Organization_SubtextInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Organization_SubtextInputs = {};
