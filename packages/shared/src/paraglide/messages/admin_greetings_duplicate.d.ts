/**
* | output |
* | --- |
* | "A greeting with this type and language already exists." |
*
* @param {Admin_Greetings_DuplicateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_duplicate: ((inputs?: Admin_Greetings_DuplicateInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_DuplicateInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_DuplicateInputs = {};
