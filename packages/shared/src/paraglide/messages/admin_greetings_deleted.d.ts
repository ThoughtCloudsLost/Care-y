/**
* | output |
* | --- |
* | "Greeting deleted." |
*
* @param {Admin_Greetings_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_deleted: ((inputs?: Admin_Greetings_DeletedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_DeletedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_DeletedInputs = {};
