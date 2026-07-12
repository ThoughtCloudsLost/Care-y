/**
* | output |
* | --- |
* | "{KnowledgeBase}" |
*
* @param {Search_Section_KbInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_section_kb: ((inputs: Search_Section_KbInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Section_KbInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Section_KbInputs = {
    KnowledgeBase: NonNullable<unknown>;
};
