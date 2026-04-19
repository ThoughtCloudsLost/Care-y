/**
* | output |
* | --- |
* | "This number is already blocked." |
*
* @param {Admin_Blacklist_Already_BlockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blacklist_already_blocked: ((inputs?: Admin_Blacklist_Already_BlockedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blacklist_Already_BlockedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blacklist_Already_BlockedInputs = {};
