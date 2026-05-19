/**
* | output |
* | --- |
* | "This will invalidate the invite link. Anyone who has the link will no longer be able to use it." |
*
* @param {Admin_Invite_Pending_Revoke_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_revoke_body: ((inputs?: Admin_Invite_Pending_Revoke_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Pending_Revoke_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Pending_Revoke_BodyInputs = {};
