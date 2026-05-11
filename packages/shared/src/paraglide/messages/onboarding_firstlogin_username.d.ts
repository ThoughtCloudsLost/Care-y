/**
* | output |
* | --- |
* | "Choose a Username" |
*
* @param {Onboarding_Firstlogin_UsernameInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_username: ((inputs?: Onboarding_Firstlogin_UsernameInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Firstlogin_UsernameInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Firstlogin_UsernameInputs = {};
