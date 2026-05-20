/**
* | output |
* | --- |
* | "Your password" |
*
* @param {Onboarding_Reauth_Password_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_reauth_password_placeholder: ((inputs?: Onboarding_Reauth_Password_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Reauth_Password_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Reauth_Password_PlaceholderInputs = {};
