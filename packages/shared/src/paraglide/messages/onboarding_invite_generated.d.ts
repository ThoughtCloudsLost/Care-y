/**
* | output |
* | --- |
* | "Invite link generated." |
*
* @param {Onboarding_Invite_GeneratedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_generated: ((inputs?: Onboarding_Invite_GeneratedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Invite_GeneratedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Invite_GeneratedInputs = {};
