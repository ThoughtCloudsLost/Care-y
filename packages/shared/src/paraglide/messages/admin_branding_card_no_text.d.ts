/**
* | output |
* | --- |
* | "No welcome text set" |
*
* @param {Admin_Branding_Card_No_TextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_card_no_text: ((inputs?: Admin_Branding_Card_No_TextInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Branding_Card_No_TextInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Branding_Card_No_TextInputs = {};
