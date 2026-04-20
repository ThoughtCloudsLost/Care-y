/**
* | output |
* | --- |
* | "Are you sure you want to remove this template?" |
*
* @param {Admin_Templates_Delete_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_delete_confirm: ((inputs?: Admin_Templates_Delete_ConfirmInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Templates_Delete_ConfirmInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Templates_Delete_ConfirmInputs = {};
