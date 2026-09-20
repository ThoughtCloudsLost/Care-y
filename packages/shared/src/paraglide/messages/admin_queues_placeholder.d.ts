/**
* | output |
* | --- |
* | "{Queue} management loading..." |
*
* @param {Admin_Queues_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_placeholder: ((inputs: Admin_Queues_PlaceholderInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queues_PlaceholderInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queues_PlaceholderInputs = {
    Queue: NonNullable<unknown>;
    queues: NonNullable<unknown>;
};
