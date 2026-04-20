/**
* | output |
* | --- |
* | "Save queue" |
*
* @param {Admin_Queue_Editor_Save_CreateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_save_create: ((inputs?: Admin_Queue_Editor_Save_CreateInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Editor_Save_CreateInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Editor_Save_CreateInputs = {};
