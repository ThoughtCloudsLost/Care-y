/**
* | output |
* | --- |
* | "A" |
*
* @param {Demo_Role_Admin_InitialInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_role_admin_initial: ((inputs?: Demo_Role_Admin_InitialInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Role_Admin_InitialInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Role_Admin_InitialInputs = {};
