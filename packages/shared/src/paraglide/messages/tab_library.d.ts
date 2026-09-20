/**
* | output |
* | --- |
* | "{KnowledgeBase}" |
*
* @param {Tab_LibraryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tab_library: ((inputs: Tab_LibraryInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tab_LibraryInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tab_LibraryInputs = {
    KnowledgeBase: NonNullable<unknown>;
};
