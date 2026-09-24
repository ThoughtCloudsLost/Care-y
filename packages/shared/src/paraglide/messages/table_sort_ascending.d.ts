/**
* | output |
* | --- |
* | "ascending" |
*
* @param {Table_Sort_AscendingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const table_sort_ascending: ((inputs?: Table_Sort_AscendingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Table_Sort_AscendingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Table_Sort_AscendingInputs = {};
