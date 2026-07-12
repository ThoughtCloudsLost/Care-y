/**
* | output |
* | --- |
* | "When your team writes an article, it shows up here." |
*
* @param {Library_Empty_Articles_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_empty_articles_body: ((inputs?: Library_Empty_Articles_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Empty_Articles_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Empty_Articles_BodyInputs = {};
