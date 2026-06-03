/**
* | output |
* | --- |
* | "Branding" |
*
* @param {Onboarding_Step_BrandingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_branding: ((inputs?: Onboarding_Step_BrandingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Step_BrandingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Step_BrandingInputs = {};
