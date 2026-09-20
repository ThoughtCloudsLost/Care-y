/**
* | output |
* | --- |
* | "New Category" |
*
* @param {Create_New_CategoryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const create_new_category: ((inputs?: Create_New_CategoryInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Create_New_CategoryInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Create_New_CategoryInputs = {};
