/**
* | output |
* | --- |
* | "Watcher removed" |
*
* @param {Admin_Queue_Watcher_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_watcher_removed: ((inputs?: Admin_Queue_Watcher_RemovedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Watcher_RemovedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Watcher_RemovedInputs = {};
