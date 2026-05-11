/**
* | output |
* | --- |
* | "Finish Setup" |
*
* @param {Onboarding_Invite_FinishInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_finish: ((inputs?: Onboarding_Invite_FinishInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Invite_FinishInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Invite_FinishInputs = {};
