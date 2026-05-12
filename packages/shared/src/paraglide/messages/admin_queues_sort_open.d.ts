/**
* | output |
* | --- |
* | "Open {tickets}" |
*
* @param {Admin_Queues_Sort_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_sort_open: ((inputs: Admin_Queues_Sort_OpenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queues_Sort_OpenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queues_Sort_OpenInputs = {
    tickets: NonNullable<unknown>;
    Tickets: NonNullable<unknown>;
};
