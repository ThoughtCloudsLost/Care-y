/**
* | output |
* | --- |
* | "When your team writes an article, it shows up here." |
*
* @param {Library_Empty_Articles_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_empty_articles_body: ((inputs?: Library_Empty_Articles_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Empty_Articles_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Empty_Articles_BodyInputs = {};
