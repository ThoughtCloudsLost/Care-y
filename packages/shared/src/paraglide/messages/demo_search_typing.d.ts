/**
* | output |
* | --- |
* | "Searching encrypted tickets" |
*
* @param {Demo_Search_TypingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_search_typing: ((inputs?: Demo_Search_TypingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Search_TypingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Search_TypingInputs = {};
