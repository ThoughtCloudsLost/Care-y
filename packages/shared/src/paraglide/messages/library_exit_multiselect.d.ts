/**
* | output |
* | --- |
* | "Exit selection mode" |
*
* @param {Library_Exit_MultiselectInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_exit_multiselect: ((inputs?: Library_Exit_MultiselectInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Exit_MultiselectInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Exit_MultiselectInputs = {};
