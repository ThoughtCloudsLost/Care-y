/**
* | output |
* | --- |
* | "Delete articles" |
*
* @param {Library_Delete_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_delete_confirm_title: ((inputs?: Library_Delete_Confirm_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Delete_Confirm_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Delete_Confirm_TitleInputs = {};
