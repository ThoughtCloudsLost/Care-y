/**
* | output |
* | --- |
* | "This number is already blocked." |
*
* @param {Admin_Blocklist_Already_BlockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_already_blocked: ((inputs?: Admin_Blocklist_Already_BlockedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blocklist_Already_BlockedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blocklist_Already_BlockedInputs = {};
