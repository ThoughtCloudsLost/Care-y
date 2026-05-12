/**
* | output |
* | --- |
* | "{Queue} created" |
*
* @param {Admin_Queue_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_created: ((inputs: Admin_Queue_CreatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_CreatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_CreatedInputs = {
    Queue: NonNullable<unknown>;
};
