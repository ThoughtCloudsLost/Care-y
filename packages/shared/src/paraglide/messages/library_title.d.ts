/**
* | output |
* | --- |
* | "{KnowledgeBase}" |
*
* @param {Library_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_title: ((inputs: Library_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_TitleInputs = {
    KnowledgeBase: NonNullable<unknown>;
};
