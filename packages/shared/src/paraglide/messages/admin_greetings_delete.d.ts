/**
* | output |
* | --- |
* | "Delete" |
*
* @param {Admin_Greetings_DeleteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_delete: ((inputs?: Admin_Greetings_DeleteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_DeleteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_DeleteInputs = {};
