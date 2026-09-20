/**
* | output |
* | --- |
* | "Welcome message shown to {clients} on the intake page." |
*
* @param {Onboarding_Branding_Text_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_text_placeholder: ((inputs: Onboarding_Branding_Text_PlaceholderInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Branding_Text_PlaceholderInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Branding_Text_PlaceholderInputs = {
    clients: NonNullable<unknown>;
};
