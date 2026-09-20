/**
* | output |
* | --- |
* | "Roles" |
*
* @param {Admin_Tab_RolesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_roles: ((inputs?: Admin_Tab_RolesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Tab_RolesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Tab_RolesInputs = {};
