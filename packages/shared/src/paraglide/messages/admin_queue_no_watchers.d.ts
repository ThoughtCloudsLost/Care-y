/**
* | output |
* | --- |
* | "No watchers" |
*
* @param {Admin_Queue_No_WatchersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_no_watchers: ((inputs?: Admin_Queue_No_WatchersInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_No_WatchersInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_No_WatchersInputs = {};
