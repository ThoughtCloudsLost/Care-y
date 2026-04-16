/**
* | output |
* | --- |
* | "Description for screen readers" |
*
* @param {Library_Editor_Alt_Text_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_alt_text_placeholder: ((inputs?: Library_Editor_Alt_Text_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Alt_Text_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Alt_Text_PlaceholderInputs = {};
