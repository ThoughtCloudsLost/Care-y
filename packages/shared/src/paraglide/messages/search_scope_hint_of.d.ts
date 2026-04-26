/**
* | output |
* | --- |
* | "Searching {searched} of {total} loaded and decrypted" |
*
* @param {Search_Scope_Hint_OfInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_scope_hint_of: ((inputs: Search_Scope_Hint_OfInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Scope_Hint_OfInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Scope_Hint_OfInputs = {
    searched: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
