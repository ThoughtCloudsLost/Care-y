/**
* | output |
* | --- |
* | "Skip for now" |
*
* @param {Onboarding_Branding_SkipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_skip: ((inputs?: Onboarding_Branding_SkipInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Branding_SkipInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Branding_SkipInputs = {};
