/**
* | output |
* | --- |
* | "Admin with full access to all features. Switch users to see how server side enforcement changes every screen." |
*
* @param {Demo_Role_Admin_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_role_admin_tooltip: ((inputs?: Demo_Role_Admin_TooltipInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Role_Admin_TooltipInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Role_Admin_TooltipInputs = {};
