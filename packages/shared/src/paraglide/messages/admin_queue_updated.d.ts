/**
* | output |
* | --- |
* | "{Queue} updated" |
*
* @param {Admin_Queue_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_updated: ((inputs: Admin_Queue_UpdatedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_UpdatedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_UpdatedInputs = {
    Queue: NonNullable<unknown>;
};
