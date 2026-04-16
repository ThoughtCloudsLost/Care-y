/**
* | output |
* | --- |
* | "Insert Link" |
*
* @param {Library_Editor_Link_Insert_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_link_insert_title: ((inputs?: Library_Editor_Link_Insert_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Link_Insert_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Link_Insert_TitleInputs = {};
