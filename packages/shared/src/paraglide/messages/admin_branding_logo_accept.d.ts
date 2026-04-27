/**
* | output |
* | --- |
* | "PNG, JPEG, or SVG. Resized to 512px automatically." |
*
* @param {Admin_Branding_Logo_AcceptInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_logo_accept: ((inputs?: Admin_Branding_Logo_AcceptInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Branding_Logo_AcceptInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Branding_Logo_AcceptInputs = {};
