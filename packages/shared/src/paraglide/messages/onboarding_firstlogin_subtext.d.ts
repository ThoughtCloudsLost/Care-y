/**
* | output |
* | --- |
* | "Your admin has invited you." |
*
* @param {Onboarding_Firstlogin_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_subtext: ((inputs?: Onboarding_Firstlogin_SubtextInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Firstlogin_SubtextInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Firstlogin_SubtextInputs = {};
