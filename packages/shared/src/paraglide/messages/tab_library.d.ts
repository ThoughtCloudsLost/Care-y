/**
* | output |
* | --- |
* | "Library" |
*
* @param {Tab_LibraryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tab_library: ((inputs?: Tab_LibraryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tab_LibraryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tab_LibraryInputs = {};
