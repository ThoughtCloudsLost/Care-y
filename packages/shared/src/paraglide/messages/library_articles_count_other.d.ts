/**
* | output |
* | --- |
* | "{count} articles" |
*
* @param {Library_Articles_Count_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_articles_count_other: ((inputs: Library_Articles_Count_OtherInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Articles_Count_OtherInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Articles_Count_OtherInputs = {
    count: NonNullable<unknown>;
};
