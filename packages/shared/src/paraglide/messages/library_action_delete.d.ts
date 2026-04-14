/**
* | output |
* | --- |
* | "Delete" |
*
* @param {Library_Action_DeleteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_action_delete: ((inputs?: Library_Action_DeleteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Action_DeleteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Action_DeleteInputs = {};
