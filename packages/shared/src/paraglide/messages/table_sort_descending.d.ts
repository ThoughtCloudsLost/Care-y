/**
* | output |
* | --- |
* | "descending" |
*
* @param {Table_Sort_DescendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const table_sort_descending: ((inputs?: Table_Sort_DescendingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Table_Sort_DescendingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Table_Sort_DescendingInputs = {};
