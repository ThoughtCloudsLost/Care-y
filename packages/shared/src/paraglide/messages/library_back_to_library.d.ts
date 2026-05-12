/**
* | output |
* | --- |
* | "Back to {KnowledgeBase}" |
*
* @param {Library_Back_To_LibraryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_back_to_library: ((inputs: Library_Back_To_LibraryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Back_To_LibraryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Back_To_LibraryInputs = {
    KnowledgeBase: NonNullable<unknown>;
};
