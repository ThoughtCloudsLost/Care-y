/**
* | output |
* | --- |
* | "{count} article" |
*
* @param {Library_Articles_Count_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_articles_count_one: ((inputs: Library_Articles_Count_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Articles_Count_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Articles_Count_OneInputs = {
    count: NonNullable<unknown>;
};
