/**
* | output |
* | --- |
* | "Change logo" |
*
* @param {Admin_Branding_Logo_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_logo_change: ((inputs?: Admin_Branding_Logo_ChangeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Branding_Logo_ChangeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Branding_Logo_ChangeInputs = {};
