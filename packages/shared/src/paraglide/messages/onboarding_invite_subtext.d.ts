/**
* | output |
* | --- |
* | "Share invite links with your team. Each link is single-use and expires in 72 hours." |
*
* @param {Onboarding_Invite_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_subtext: ((inputs?: Onboarding_Invite_SubtextInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Invite_SubtextInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Invite_SubtextInputs = {};
