/**
* | output |
* | --- |
* | "{count} article" |
*
* @param {Library_Articles_Count_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_articles_count_one: ((inputs: Library_Articles_Count_OneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Articles_Count_OneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Articles_Count_OneInputs = {
    count: NonNullable<unknown>;
};
