/**
* | output |
* | --- |
* | "New Category" |
*
* @param {Create_New_CategoryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const create_new_category: ((inputs?: Create_New_CategoryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Create_New_CategoryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Create_New_CategoryInputs = {};
