/**
* | output |
* | --- |
* | "Sign In" |
*
* @param {Onboarding_Firstlogin_SigninInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_signin: ((inputs?: Onboarding_Firstlogin_SigninInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Firstlogin_SigninInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Firstlogin_SigninInputs = {};
