/**
* | output |
* | --- |
* | "{Queue} name is required" |
*
* @param {Admin_Queue_Editor_Name_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_name_required: ((inputs: Admin_Queue_Editor_Name_RequiredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Editor_Name_RequiredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Editor_Name_RequiredInputs = {
    Queue: NonNullable<unknown>;
    queue: NonNullable<unknown>;
};
