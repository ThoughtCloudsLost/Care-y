/**
* | output |
* | --- |
* | "Move up" |
*
* @param {Admin_Queue_Move_UpInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_move_up: ((inputs?: Admin_Queue_Move_UpInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Move_UpInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Move_UpInputs = {};
