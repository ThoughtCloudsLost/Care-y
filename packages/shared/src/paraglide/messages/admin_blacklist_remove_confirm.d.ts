/**
* | output |
* | --- |
* | "This number will no longer be blocked. Are you sure?" |
*
* @param {Admin_Blacklist_Remove_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blacklist_remove_confirm: ((inputs?: Admin_Blacklist_Remove_ConfirmInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blacklist_Remove_ConfirmInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blacklist_Remove_ConfirmInputs = {};
