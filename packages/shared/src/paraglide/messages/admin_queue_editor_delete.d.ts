/**
* | output |
* | --- |
* | "Delete {Queue}" |
*
* @param {Admin_Queue_Editor_DeleteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_delete: ((inputs: Admin_Queue_Editor_DeleteInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Editor_DeleteInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Editor_DeleteInputs = {
    Queue: NonNullable<unknown>;
    queue: NonNullable<unknown>;
};
