/**
* | output |
* | --- |
* | "Author" |
*
* @param {Library_Table_Col_AuthorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_table_col_author: ((inputs?: Library_Table_Col_AuthorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Table_Col_AuthorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Table_Col_AuthorInputs = {};
