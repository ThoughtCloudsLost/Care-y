/**
* | output |
* | --- |
* | "Search {volunteers}" |
*
* @param {Admin_Queue_Watcher_Picker_SearchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_watcher_picker_search: ((inputs: Admin_Queue_Watcher_Picker_SearchInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Watcher_Picker_SearchInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Watcher_Picker_SearchInputs = {
    volunteers: NonNullable<unknown>;
};
