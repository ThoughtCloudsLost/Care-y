/**
* | output |
* | --- |
* | "Welcome message shown to clients on the intake page." |
*
* @param {Onboarding_Branding_Text_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_text_placeholder: ((inputs?: Onboarding_Branding_Text_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Branding_Text_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Branding_Text_PlaceholderInputs = {};
