/**
* | output |
* | --- |
* | "Coming in a future update" |
*
* @param {Admin_Branding_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_placeholder: ((inputs?: Admin_Branding_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Branding_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Branding_PlaceholderInputs = {};
