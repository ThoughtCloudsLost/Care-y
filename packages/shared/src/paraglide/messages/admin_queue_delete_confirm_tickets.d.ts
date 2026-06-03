/**
* | output |
* | --- |
* | "This {queue} has {tickets}. Choose a {queue} to move them to before deleting." |
*
* @param {Admin_Queue_Delete_Confirm_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_delete_confirm_tickets: ((inputs: Admin_Queue_Delete_Confirm_TicketsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Delete_Confirm_TicketsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Delete_Confirm_TicketsInputs = {
    queue: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};
