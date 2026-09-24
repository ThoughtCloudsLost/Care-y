/**
* | output |
* | --- |
* | "{Queue}" |
*
* @param {Admin_Users_Filter_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_users_filter_queue: ((inputs: Admin_Users_Filter_QueueInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Users_Filter_QueueInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Users_Filter_QueueInputs = {
    Queue: NonNullable<unknown>;
};
