/**
* | output |
* | --- |
* | "Select an article to read" |
*
* @param {Library_Select_Article_PromptInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_select_article_prompt: ((inputs?: Library_Select_Article_PromptInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Select_Article_PromptInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Select_Article_PromptInputs = {};
