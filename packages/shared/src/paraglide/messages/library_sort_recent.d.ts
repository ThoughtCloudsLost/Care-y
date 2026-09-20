/**
* | output |
* | --- |
* | "Recently updated" |
*
* @param {Library_Sort_RecentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_sort_recent: ((inputs?: Library_Sort_RecentInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Sort_RecentInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Sort_RecentInputs = {};
