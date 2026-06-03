/**
* | output |
* | --- |
* | "Your login username" |
*
* @param {Onboarding_Reauth_Username_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_reauth_username_placeholder: ((inputs?: Onboarding_Reauth_Username_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Reauth_Username_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Reauth_Username_PlaceholderInputs = {};
