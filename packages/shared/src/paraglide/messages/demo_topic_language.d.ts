/**
* | output |
* | --- |
* | "Language" |
*
* @param {Demo_Topic_LanguageInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_language: ((inputs?: Demo_Topic_LanguageInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Topic_LanguageInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Topic_LanguageInputs = {};
