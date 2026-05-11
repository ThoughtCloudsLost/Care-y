/**
* | output |
* | --- |
* | "PNG, JPEG, or SVG. Max 512 KB." |
*
* @param {Onboarding_Branding_Logo_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_logo_hint: ((inputs?: Onboarding_Branding_Logo_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Branding_Logo_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Branding_Logo_HintInputs = {};
