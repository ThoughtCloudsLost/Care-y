/**
* | output |
* | --- |
* | "Branding" |
*
* @param {Onboarding_Step_BrandingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_branding: ((inputs?: Onboarding_Step_BrandingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Step_BrandingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Step_BrandingInputs = {};
