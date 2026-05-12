/**
* | output |
* | --- |
* | "Edit {queue}" |
*
* @param {Admin_Queue_EditInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_edit: ((inputs: Admin_Queue_EditInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_EditInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_EditInputs = {
    queue: NonNullable<unknown>;
};
