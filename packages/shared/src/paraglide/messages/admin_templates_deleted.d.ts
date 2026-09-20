/**
* | output |
* | --- |
* | "Template deleted." |
*
* @param {Admin_Templates_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_templates_deleted: ((inputs?: Admin_Templates_DeletedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Templates_DeletedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Templates_DeletedInputs = {};
