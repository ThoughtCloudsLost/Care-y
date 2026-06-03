/**
* | output |
* | --- |
* | "I'll invite {volunteers} later" |
*
* @param {Onboarding_Invite_SkipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_skip: ((inputs: Onboarding_Invite_SkipInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Invite_SkipInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Invite_SkipInputs = {
    volunteers: NonNullable<unknown>;
};
