/**
* | output |
* | --- |
* | "Move tickets to" |
*
* @param {Admin_Queue_Delete_Reassign_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_delete_reassign_label: ((inputs?: Admin_Queue_Delete_Reassign_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Delete_Reassign_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Delete_Reassign_LabelInputs = {};
