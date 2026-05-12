/**
* | output |
* | --- |
* | "Create {queue}" |
*
* @param {Admin_Queues_Create_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_create_button: ((inputs: Admin_Queues_Create_ButtonInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queues_Create_ButtonInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queues_Create_ButtonInputs = {
    queue: NonNullable<unknown>;
};
