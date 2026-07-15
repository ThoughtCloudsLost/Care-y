/**
* | output |
* | --- |
* | "Category" |
*
* @param {Library_Table_Col_CategoryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_table_col_category: ((inputs?: Library_Table_Col_CategoryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Table_Col_CategoryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Table_Col_CategoryInputs = {};
