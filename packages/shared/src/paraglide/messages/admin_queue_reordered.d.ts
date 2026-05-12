/**
* | output |
* | --- |
* | "{Queue} order updated" |
*
* @param {Admin_Queue_ReorderedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_reordered: ((inputs: Admin_Queue_ReorderedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_ReorderedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_ReorderedInputs = {
    Queue: NonNullable<unknown>;
    queues: NonNullable<unknown>;
};
