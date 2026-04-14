/**
* | output |
* | --- |
* | "Edit article" |
*
* @param {Library_Edit_ArticleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_edit_article: ((inputs?: Library_Edit_ArticleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Edit_ArticleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Edit_ArticleInputs = {};
