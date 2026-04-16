/**
* | output |
* | --- |
* | "Start writing your article..." |
*
* @param {Library_Article_Body_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_article_body_placeholder: ((inputs?: Library_Article_Body_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Article_Body_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Article_Body_PlaceholderInputs = {};
