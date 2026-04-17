/**
* | output |
* | --- |
* | "This queue has no tickets and will be permanently deleted." |
*
* @param {Admin_Queue_Delete_Confirm_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_delete_confirm_empty: ((inputs?: Admin_Queue_Delete_Confirm_EmptyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Delete_Confirm_EmptyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Delete_Confirm_EmptyInputs = {};
