/**
* | output |
* | --- |
* | "Used for icons, badges, and secondary highlights." |
*
* @param {Admin_Branding_Accent_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_accent_hint: ((inputs?: Admin_Branding_Accent_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Branding_Accent_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Branding_Accent_HintInputs = {};
