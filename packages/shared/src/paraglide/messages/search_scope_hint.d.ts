/**
* | output |
* | --- |
* | "Searching {count} loaded and decrypted" |
*
* @param {Search_Scope_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_scope_hint: ((inputs: Search_Scope_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Scope_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Scope_HintInputs = {
    count: NonNullable<unknown>;
};
