/**
* | output |
* | --- |
* | "1." |
*
* @param {Library_Editor_Ordered_List_SymbolInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_ordered_list_symbol: ((inputs?: Library_Editor_Ordered_List_SymbolInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Ordered_List_SymbolInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Ordered_List_SymbolInputs = {};
