/**
* | output |
* | --- |
* | "Rotate organization key" |
*
* @param {Admin_Rotation_Dialog_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_dialog_title: ((inputs?: Admin_Rotation_Dialog_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Rotation_Dialog_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Rotation_Dialog_TitleInputs = {};
