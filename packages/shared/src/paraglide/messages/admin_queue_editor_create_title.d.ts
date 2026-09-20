/**
* | output |
* | --- |
* | "Create {Queue}" |
*
* @param {Admin_Queue_Editor_Create_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_create_title: ((inputs: Admin_Queue_Editor_Create_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Editor_Create_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Editor_Create_TitleInputs = {
    Queue: NonNullable<unknown>;
    queue: NonNullable<unknown>;
};
