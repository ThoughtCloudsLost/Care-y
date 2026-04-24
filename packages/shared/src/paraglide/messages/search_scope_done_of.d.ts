/**
* | output |
* | --- |
* | "Searched {searched} of {total} items" |
*
* @param {Search_Scope_Done_OfInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_scope_done_of: ((inputs: Search_Scope_Done_OfInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Scope_Done_OfInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Scope_Done_OfInputs = {
    searched: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
