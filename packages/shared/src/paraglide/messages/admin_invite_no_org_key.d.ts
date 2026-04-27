/**
* | output |
* | --- |
* | "Organization key not loaded. Cannot invite users." |
*
* @param {Admin_Invite_No_Org_KeyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_no_org_key: ((inputs?: Admin_Invite_No_Org_KeyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_No_Org_KeyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_No_Org_KeyInputs = {};
