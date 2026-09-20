/**
* | output |
* | --- |
* | "Article title" |
*
* @param {Library_Article_Title_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_article_title_placeholder: ((inputs?: Library_Article_Title_PlaceholderInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Article_Title_PlaceholderInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Article_Title_PlaceholderInputs = {};
