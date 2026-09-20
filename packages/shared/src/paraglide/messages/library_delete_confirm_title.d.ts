/**
* | output |
* | --- |
* | "Delete articles" |
*
* @param {Library_Delete_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_delete_confirm_title: ((inputs?: Library_Delete_Confirm_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Delete_Confirm_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Delete_Confirm_TitleInputs = {};
