/**
* | output |
* | --- |
* | "Edit {Queue}" |
*
* @param {Admin_Queue_Editor_Edit_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_edit_title: ((inputs: Admin_Queue_Editor_Edit_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Editor_Edit_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Editor_Edit_TitleInputs = {
    Queue: NonNullable<unknown>;
    queue: NonNullable<unknown>;
};
