/**
* | output |
* | --- |
* | "1." |
*
* @param {Library_Editor_Ordered_List_SymbolInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_ordered_list_symbol: ((inputs?: Library_Editor_Ordered_List_SymbolInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Ordered_List_SymbolInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Ordered_List_SymbolInputs = {};
