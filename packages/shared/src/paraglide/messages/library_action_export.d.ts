/**
* | output |
* | --- |
* | "Export" |
*
* @param {Library_Action_ExportInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_action_export: ((inputs?: Library_Action_ExportInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Action_ExportInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Action_ExportInputs = {};
