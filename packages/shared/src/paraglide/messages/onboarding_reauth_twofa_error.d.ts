/**
* | output |
* | --- |
* | "Verification failed. Try again." |
*
* @param {Onboarding_Reauth_Twofa_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_reauth_twofa_error: ((inputs?: Onboarding_Reauth_Twofa_ErrorInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Reauth_Twofa_ErrorInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Reauth_Twofa_ErrorInputs = {};
