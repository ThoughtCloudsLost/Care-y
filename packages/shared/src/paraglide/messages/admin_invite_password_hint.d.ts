/**
* | output |
* | --- |
* | "Share securely with the {volunteer}. They should change it after first login." |
*
* @param {Admin_Invite_Password_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_password_hint: ((inputs: Admin_Invite_Password_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Password_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Password_HintInputs = {
    volunteer: NonNullable<unknown>;
};
