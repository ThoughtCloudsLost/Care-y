/**
* | output |
* | --- |
* | "unsorted" |
*
* @param {Table_Sort_UnsortedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const table_sort_unsorted: ((inputs?: Table_Sort_UnsortedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Table_Sort_UnsortedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Table_Sort_UnsortedInputs = {};
