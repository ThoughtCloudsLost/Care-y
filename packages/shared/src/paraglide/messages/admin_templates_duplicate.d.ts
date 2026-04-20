/**
* | output |
* | --- |
* | "A template with this type and language already exists." |
*
* @param {Admin_Templates_DuplicateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_duplicate: ((inputs?: Admin_Templates_DuplicateInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Templates_DuplicateInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Templates_DuplicateInputs = {};
