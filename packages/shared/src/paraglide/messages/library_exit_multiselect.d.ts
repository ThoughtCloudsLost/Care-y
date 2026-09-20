/**
* | output |
* | --- |
* | "Exit selection mode" |
*
* @param {Library_Exit_MultiselectInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_exit_multiselect: ((inputs?: Library_Exit_MultiselectInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Exit_MultiselectInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Exit_MultiselectInputs = {};
