/**
* | output |
* | --- |
* | "Edit Article" |
*
* @param {Library_Edit_Article_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_edit_article_title: ((inputs?: Library_Edit_Article_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Edit_Article_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Edit_Article_TitleInputs = {};
