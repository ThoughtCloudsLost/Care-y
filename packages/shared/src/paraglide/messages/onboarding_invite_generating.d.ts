/**
* | output |
* | --- |
* | "Generating..." |
*
* @param {Onboarding_Invite_GeneratingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_generating: ((inputs?: Onboarding_Invite_GeneratingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Invite_GeneratingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Invite_GeneratingInputs = {};
