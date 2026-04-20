/**
* | output |
* | --- |
* | "Organization name" |
*
* @param {Admin_Branding_Card_Name_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_card_name_label: ((inputs?: Admin_Branding_Card_Name_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Branding_Card_Name_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Branding_Card_Name_LabelInputs = {};
