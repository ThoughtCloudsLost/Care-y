/**
* | output |
* | --- |
* | "By {author}" |
*
* @param {Library_Article_ByInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_article_by: ((inputs: Library_Article_ByInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Article_ByInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Article_ByInputs = {
    author: NonNullable<unknown>;
};
