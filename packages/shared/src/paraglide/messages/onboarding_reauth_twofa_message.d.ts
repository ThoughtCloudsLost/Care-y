/**
* | output |
* | --- |
* | "Verify your identity to continue setup." |
*
* @param {Onboarding_Reauth_Twofa_MessageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_reauth_twofa_message: ((inputs?: Onboarding_Reauth_Twofa_MessageInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Reauth_Twofa_MessageInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Reauth_Twofa_MessageInputs = {};
