/**
* | output |
* | --- |
* | "This invite link is invalid or has expired." |
*
* @param {Onboarding_Firstlogin_Error_Invalid_TokenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_error_invalid_token: ((inputs?: Onboarding_Firstlogin_Error_Invalid_TokenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Firstlogin_Error_Invalid_TokenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Firstlogin_Error_Invalid_TokenInputs = {};
