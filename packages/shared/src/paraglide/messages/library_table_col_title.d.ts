/**
* | output |
* | --- |
* | "Title" |
*
* @param {Library_Table_Col_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_table_col_title: ((inputs?: Library_Table_Col_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Table_Col_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Table_Col_TitleInputs = {};
