/**
* | output |
* | --- |
* | "Sign back in to unlock your keys and continue setup." |
*
* @param {Onboarding_Reauth_MessageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_reauth_message: ((inputs?: Onboarding_Reauth_MessageInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Reauth_MessageInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Reauth_MessageInputs = {};
