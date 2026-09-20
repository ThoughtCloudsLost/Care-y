/**
* | output |
* | --- |
* | "Watcher added" |
*
* @param {Admin_Queue_Watcher_AddedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_watcher_added: ((inputs?: Admin_Queue_Watcher_AddedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Watcher_AddedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Watcher_AddedInputs = {};
