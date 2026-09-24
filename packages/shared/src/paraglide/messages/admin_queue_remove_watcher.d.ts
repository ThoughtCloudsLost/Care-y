/**
* | output |
* | --- |
* | "Remove {name} from watchers" |
*
* @param {Admin_Queue_Remove_WatcherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_remove_watcher: ((inputs: Admin_Queue_Remove_WatcherInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Remove_WatcherInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Remove_WatcherInputs = {
    name: NonNullable<unknown>;
};
