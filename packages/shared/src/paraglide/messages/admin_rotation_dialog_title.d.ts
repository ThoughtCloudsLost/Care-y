/**
* | output |
* | --- |
* | "Rotate organization key" |
*
* @param {Admin_Rotation_Dialog_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_dialog_title: ((inputs?: Admin_Rotation_Dialog_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Rotation_Dialog_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Rotation_Dialog_TitleInputs = {};
