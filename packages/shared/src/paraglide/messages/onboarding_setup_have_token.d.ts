/**
* | output |
* | --- |
* | "Have a setup token?" |
*
* @param {Onboarding_Setup_Have_TokenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_have_token: ((inputs?: Onboarding_Setup_Have_TokenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Setup_Have_TokenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Setup_Have_TokenInputs = {};
