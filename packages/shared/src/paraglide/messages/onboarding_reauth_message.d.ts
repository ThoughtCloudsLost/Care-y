/**
* | output |
* | --- |
* | "Sign back in to unlock your keys and continue setup." |
*
* @param {Onboarding_Reauth_MessageInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_reauth_message: ((inputs?: Onboarding_Reauth_MessageInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Reauth_MessageInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Reauth_MessageInputs = {};
