/**
* | output |
* | --- |
* | "Image must be under 512 KB." |
*
* @param {Admin_Branding_Logo_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_logo_too_large: ((inputs?: Admin_Branding_Logo_Too_LargeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Branding_Logo_Too_LargeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Branding_Logo_Too_LargeInputs = {};
