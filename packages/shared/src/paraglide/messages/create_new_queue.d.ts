/**
* | output |
* | --- |
* | "New {Queue}" |
*
* @param {Create_New_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const create_new_queue: ((inputs: Create_New_QueueInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Create_New_QueueInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Create_New_QueueInputs = {
    Queue: NonNullable<unknown>;
};
