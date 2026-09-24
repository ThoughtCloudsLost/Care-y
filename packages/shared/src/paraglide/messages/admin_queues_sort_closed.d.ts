/**
* | output |
* | --- |
* | "Closed {tickets}" |
*
* @param {Admin_Queues_Sort_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_sort_closed: ((inputs: Admin_Queues_Sort_ClosedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queues_Sort_ClosedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queues_Sort_ClosedInputs = {
    tickets: NonNullable<unknown>;
    Tickets: NonNullable<unknown>;
};
