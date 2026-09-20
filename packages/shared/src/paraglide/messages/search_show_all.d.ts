/**
* | output |
* | --- |
* | "Show all" |
*
* @param {Search_Show_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_show_all: ((inputs?: Search_Show_AllInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Show_AllInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Show_AllInputs = {};
