/**
* | output |
* | --- |
* | "e.g. General Intake" |
*
* @param {Admin_Queue_Editor_Name_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_name_placeholder: ((inputs?: Admin_Queue_Editor_Name_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Editor_Name_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Editor_Name_PlaceholderInputs = {};
