/**
* | output |
* | --- |
* | "Expires {expiresAt}" |
*
* @param {Admin_Invite_Link_ExpiresInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_expires: ((inputs: Admin_Invite_Link_ExpiresInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Link_ExpiresInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Link_ExpiresInputs = {
    expiresAt: NonNullable<unknown>;
};
