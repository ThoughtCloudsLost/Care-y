/**
* | output |
* | --- |
* | "Move category" |
*
* @param {Library_Move_CategoryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_move_category: ((inputs?: Library_Move_CategoryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Move_CategoryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Move_CategoryInputs = {};
