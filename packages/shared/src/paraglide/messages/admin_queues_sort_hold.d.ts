/**
* | output |
* | --- |
* | "On hold" |
*
* @param {Admin_Queues_Sort_HoldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_sort_hold: ((inputs?: Admin_Queues_Sort_HoldInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queues_Sort_HoldInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queues_Sort_HoldInputs = {};
