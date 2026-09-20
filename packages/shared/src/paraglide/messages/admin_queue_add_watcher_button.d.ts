/**
* | output |
* | --- |
* | "Add watcher" |
*
* @param {Admin_Queue_Add_Watcher_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_add_watcher_button: ((inputs?: Admin_Queue_Add_Watcher_ButtonInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Add_Watcher_ButtonInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Add_Watcher_ButtonInputs = {};
