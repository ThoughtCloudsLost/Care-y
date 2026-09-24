/**
* | output |
* | --- |
* | "Share invite links with your team, or create accounts directly. Each invite link is single-use and expires in 72 hours." |
*
* @param {Onboarding_Invite_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_subtext: ((inputs?: Onboarding_Invite_SubtextInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Invite_SubtextInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Invite_SubtextInputs = {};
