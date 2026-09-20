/**
* | output |
* | --- |
* | "Move or delete all articles in this category first" |
*
* @param {Library_Category_Delete_BlockedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_category_delete_blocked: ((inputs?: Library_Category_Delete_BlockedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Category_Delete_BlockedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Category_Delete_BlockedInputs = {};
