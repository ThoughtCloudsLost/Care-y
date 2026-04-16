/**
* | output |
* | --- |
* | "{count} articles" |
*
* @param {Library_Articles_Count_OtherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_articles_count_other: ((inputs: Library_Articles_Count_OtherInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Articles_Count_OtherInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Articles_Count_OtherInputs = {
    count: NonNullable<unknown>;
};
