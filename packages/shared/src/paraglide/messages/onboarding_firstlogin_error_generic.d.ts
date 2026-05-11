/**
* | output |
* | --- |
* | "Account creation failed. Please try again." |
*
* @param {Onboarding_Firstlogin_Error_GenericInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_error_generic: ((inputs?: Onboarding_Firstlogin_Error_GenericInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Firstlogin_Error_GenericInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Firstlogin_Error_GenericInputs = {};
