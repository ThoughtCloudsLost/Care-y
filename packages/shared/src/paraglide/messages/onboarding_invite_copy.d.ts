/**
* | output |
* | --- |
* | "Copy" |
*
* @param {Onboarding_Invite_CopyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_copy: ((inputs?: Onboarding_Invite_CopyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Invite_CopyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Invite_CopyInputs = {};
