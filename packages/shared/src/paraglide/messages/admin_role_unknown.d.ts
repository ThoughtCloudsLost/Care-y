/**
* | output |
* | --- |
* | "Unknown role" |
*
* @param {Admin_Role_UnknownInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_role_unknown: ((inputs?: Admin_Role_UnknownInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Role_UnknownInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Role_UnknownInputs = {};
