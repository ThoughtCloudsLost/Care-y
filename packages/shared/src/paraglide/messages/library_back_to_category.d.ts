/**
* | output |
* | --- |
* | "Back to {category}" |
*
* @param {Library_Back_To_CategoryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_back_to_category: ((inputs: Library_Back_To_CategoryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Back_To_CategoryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Back_To_CategoryInputs = {
    category: NonNullable<unknown>;
};
