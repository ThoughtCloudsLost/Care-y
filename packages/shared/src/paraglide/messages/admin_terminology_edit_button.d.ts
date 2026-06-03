/**
* | output |
* | --- |
* | "Edit Terms" |
*
* @param {Admin_Terminology_Edit_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_edit_button: ((inputs?: Admin_Terminology_Edit_ButtonInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_Edit_ButtonInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_Edit_ButtonInputs = {};
