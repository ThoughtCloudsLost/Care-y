/**
* | output |
* | --- |
* | "Save changes" |
*
* @param {Admin_Greetings_Save_EditInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_save_edit: ((inputs?: Admin_Greetings_Save_EditInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Save_EditInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Save_EditInputs = {};
