/**
* | output |
* | --- |
* | "Searched {count} loaded and decrypted" |
*
* @param {Search_Scope_DoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_scope_done: ((inputs: Search_Scope_DoneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Scope_DoneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Scope_DoneInputs = {
    count: NonNullable<unknown>;
};
