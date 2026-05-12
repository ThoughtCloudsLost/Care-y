/**
* | output |
* | --- |
* | "{Queue}" |
*
* @param {Tickets_Sort_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_queue: ((inputs: Tickets_Sort_QueueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Sort_QueueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Sort_QueueInputs = {
    Queue: NonNullable<unknown>;
};
