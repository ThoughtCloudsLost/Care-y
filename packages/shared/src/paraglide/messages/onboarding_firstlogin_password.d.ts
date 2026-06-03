/**
* | output |
* | --- |
* | "Password" |
*
* @param {Onboarding_Firstlogin_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_password: ((inputs?: Onboarding_Firstlogin_PasswordInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Firstlogin_PasswordInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Firstlogin_PasswordInputs = {};
