/**
* | output |
* | --- |
* | "Admin" |
*
* @param {Admin_Role_AdminInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_role_admin: ((inputs?: Admin_Role_AdminInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Role_AdminInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Role_AdminInputs = {};
