/**
* | output |
* | --- |
* | "Paste your setup token" |
*
* @param {Onboarding_Setup_Token_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_token_placeholder: ((inputs?: Onboarding_Setup_Token_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Setup_Token_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Setup_Token_PlaceholderInputs = {};
