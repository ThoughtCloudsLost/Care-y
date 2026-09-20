/**
* | output |
* | --- |
* | "Failed to save branding." |
*
* @param {Onboarding_Branding_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_error: ((inputs?: Onboarding_Branding_ErrorInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Branding_ErrorInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Branding_ErrorInputs = {};
