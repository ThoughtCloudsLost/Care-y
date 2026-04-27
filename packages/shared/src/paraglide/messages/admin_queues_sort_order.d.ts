/**
* | output |
* | --- |
* | "Custom order" |
*
* @param {Admin_Queues_Sort_OrderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_sort_order: ((inputs?: Admin_Queues_Sort_OrderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queues_Sort_OrderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queues_Sort_OrderInputs = {};
