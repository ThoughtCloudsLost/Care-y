/**
* | output |
* | --- |
* | "Are you sure you want to remove this greeting?" |
*
* @param {Admin_Greetings_Delete_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_delete_confirm: ((inputs?: Admin_Greetings_Delete_ConfirmInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Delete_ConfirmInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Delete_ConfirmInputs = {};
