/**
* | output |
* | --- |
* | "Updated {time}" |
*
* @param {Library_Article_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_article_updated: ((inputs: Library_Article_UpdatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Article_UpdatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Article_UpdatedInputs = {
    time: NonNullable<unknown>;
};
