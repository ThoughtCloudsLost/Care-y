/**
* | output |
* | --- |
* | "Edit Article" |
*
* @param {Library_Edit_Article_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_edit_article_title: ((inputs?: Library_Edit_Article_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Edit_Article_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Edit_Article_TitleInputs = {};
