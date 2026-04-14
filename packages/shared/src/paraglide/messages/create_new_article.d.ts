/**
* | output |
* | --- |
* | "New Article" |
*
* @param {Create_New_ArticleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const create_new_article: ((inputs?: Create_New_ArticleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Create_New_ArticleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Create_New_ArticleInputs = {};
