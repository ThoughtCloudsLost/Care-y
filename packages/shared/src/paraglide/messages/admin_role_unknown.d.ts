/**
* | output |
* | --- |
* | "Unknown role" |
*
* @param {Admin_Role_UnknownInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_role_unknown: ((inputs?: Admin_Role_UnknownInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Role_UnknownInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Role_UnknownInputs = {};
