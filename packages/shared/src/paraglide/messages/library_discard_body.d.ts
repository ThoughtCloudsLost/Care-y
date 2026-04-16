/**
* | output |
* | --- |
* | "You have unsaved changes. Discard them?" |
*
* @param {Library_Discard_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_discard_body: ((inputs?: Library_Discard_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Discard_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Discard_BodyInputs = {};
