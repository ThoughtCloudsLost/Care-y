/**
* | output |
* | --- |
* | "Invites" |
*
* @param {Onboarding_Step_InvitesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_invites: ((inputs?: Onboarding_Step_InvitesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Step_InvitesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Step_InvitesInputs = {};
