/**
* | output |
* | --- |
* | "Article not found." |
*
* @param {Error_Kb_Article_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_kb_article_not_found: ((inputs?: Error_Kb_Article_Not_FoundInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Kb_Article_Not_FoundInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Kb_Article_Not_FoundInputs = {};
