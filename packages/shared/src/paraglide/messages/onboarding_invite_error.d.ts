/**
* | output |
* | --- |
* | "Failed to generate invite link." |
*
* @param {Onboarding_Invite_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_error: ((inputs?: Onboarding_Invite_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Invite_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Invite_ErrorInputs = {};
