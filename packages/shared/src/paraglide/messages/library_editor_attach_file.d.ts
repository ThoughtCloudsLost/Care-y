/**
* | output |
* | --- |
* | "Attach file" |
*
* @param {Library_Editor_Attach_FileInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_attach_file: ((inputs?: Library_Editor_Attach_FileInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Attach_FileInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Attach_FileInputs = {};
