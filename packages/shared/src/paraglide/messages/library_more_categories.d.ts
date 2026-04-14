/**
* | output |
* | --- |
* | "& {count} more" |
*
* @param {Library_More_CategoriesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_more_categories: ((inputs: Library_More_CategoriesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_More_CategoriesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_More_CategoriesInputs = {
    count: NonNullable<unknown>;
};
