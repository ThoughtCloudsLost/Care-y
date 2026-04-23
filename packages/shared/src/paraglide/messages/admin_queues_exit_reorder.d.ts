/**
* | output |
* | --- |
* | "Done" |
*
* @param {Admin_Queues_Exit_ReorderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_exit_reorder: ((inputs?: Admin_Queues_Exit_ReorderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queues_Exit_ReorderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queues_Exit_ReorderInputs = {};
