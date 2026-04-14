/**
* | output |
* | --- |
* | "Recently updated" |
*
* @param {Library_Sort_RecentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_sort_recent: ((inputs?: Library_Sort_RecentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Sort_RecentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Sort_RecentInputs = {};
