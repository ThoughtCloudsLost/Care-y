/**
* | output |
* | --- |
* | "Badges" |
*
* @param {Admin_Branding_Preview_BadgesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_preview_badges: ((inputs?: Admin_Branding_Preview_BadgesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Branding_Preview_BadgesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Branding_Preview_BadgesInputs = {};
