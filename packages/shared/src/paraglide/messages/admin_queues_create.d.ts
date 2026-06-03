/**
* | output |
* | --- |
* | "Create {Queue}" |
*
* @param {Admin_Queues_CreateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_create: ((inputs: Admin_Queues_CreateInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queues_CreateInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queues_CreateInputs = {
    Queue: NonNullable<unknown>;
    queue: NonNullable<unknown>;
};
