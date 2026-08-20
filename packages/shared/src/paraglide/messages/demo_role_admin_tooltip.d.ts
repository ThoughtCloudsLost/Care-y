/**
* | output |
* | --- |
* | "Admin with full access to all features. Switch users to see how server side enforcement changes every screen." |
*
* @param {Demo_Role_Admin_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_role_admin_tooltip: ((inputs?: Demo_Role_Admin_TooltipInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Role_Admin_TooltipInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Role_Admin_TooltipInputs = {};
