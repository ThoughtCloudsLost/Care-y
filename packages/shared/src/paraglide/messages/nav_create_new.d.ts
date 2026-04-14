/**
* | output |
* | --- |
* | "Create new" |
*
* @param {Nav_Create_NewInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_create_new: ((inputs?: Nav_Create_NewInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Nav_Create_NewInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Nav_Create_NewInputs = {};
