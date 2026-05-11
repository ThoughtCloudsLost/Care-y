/**
* | output |
* | --- |
* | "Generate Invite Link" |
*
* @param {Onboarding_Invite_GenerateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_generate: ((inputs?: Onboarding_Invite_GenerateInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Invite_GenerateInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Invite_GenerateInputs = {};
