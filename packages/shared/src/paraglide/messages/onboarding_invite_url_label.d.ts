/**
* | output |
* | --- |
* | "Invite link:" |
*
* @param {Onboarding_Invite_Url_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_url_label: ((inputs?: Onboarding_Invite_Url_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Invite_Url_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Invite_Url_LabelInputs = {};
