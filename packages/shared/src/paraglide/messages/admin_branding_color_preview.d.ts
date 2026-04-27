/**
* | output |
* | --- |
* | "Preview" |
*
* @param {Admin_Branding_Color_PreviewInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_color_preview: ((inputs?: Admin_Branding_Color_PreviewInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Branding_Color_PreviewInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Branding_Color_PreviewInputs = {};
