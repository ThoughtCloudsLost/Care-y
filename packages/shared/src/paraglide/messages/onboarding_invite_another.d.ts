/**
* | output |
* | --- |
* | "Generate Another" |
*
* @param {Onboarding_Invite_AnotherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_another: ((inputs?: Onboarding_Invite_AnotherInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Invite_AnotherInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Invite_AnotherInputs = {};
