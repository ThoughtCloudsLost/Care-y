/**
* | output |
* | --- |
* | "Describe this image" |
*
* @param {Library_Editor_Alt_Text_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_alt_text_title: ((inputs?: Library_Editor_Alt_Text_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Alt_Text_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Alt_Text_TitleInputs = {};
