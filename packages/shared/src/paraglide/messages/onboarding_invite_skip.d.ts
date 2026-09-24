/**
* | output |
* | --- |
* | "I'll invite {volunteers} later" |
*
* @param {Onboarding_Invite_SkipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_skip: ((inputs: Onboarding_Invite_SkipInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Invite_SkipInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Invite_SkipInputs = {
    volunteers: NonNullable<unknown>;
};
