/**
* | output |
* | --- |
* | "Create {queue}" |
*
* @param {Admin_Queues_Create_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_create_button: ((inputs: Admin_Queues_Create_ButtonInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queues_Create_ButtonInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queues_Create_ButtonInputs = {
    queue: NonNullable<unknown>;
};
