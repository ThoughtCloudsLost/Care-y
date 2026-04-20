/**
* | output |
* | --- |
* | "App icon generation failed. Logo saved, but icons may not update." |
*
* @param {Admin_Branding_Icons_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_icons_error: ((inputs?: Admin_Branding_Icons_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Branding_Icons_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Branding_Icons_ErrorInputs = {};
