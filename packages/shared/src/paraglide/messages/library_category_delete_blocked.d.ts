/**
* | output |
* | --- |
* | "Move or delete all articles in this category first" |
*
* @param {Library_Category_Delete_BlockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_category_delete_blocked: ((inputs?: Library_Category_Delete_BlockedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Category_Delete_BlockedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Category_Delete_BlockedInputs = {};
