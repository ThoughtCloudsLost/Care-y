/**
* | output |
* | --- |
* | "Expires {expiresAt}" |
*
* @param {Onboarding_Invite_ExpiresInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_expires: ((inputs: Onboarding_Invite_ExpiresInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Invite_ExpiresInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Invite_ExpiresInputs = {
    expiresAt: NonNullable<unknown>;
};
