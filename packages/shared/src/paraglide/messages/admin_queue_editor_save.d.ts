/**
* | output |
* | --- |
* | "Save" |
*
* @param {Admin_Queue_Editor_SaveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_save: ((inputs?: Admin_Queue_Editor_SaveInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Editor_SaveInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Editor_SaveInputs = {};
