/**
* | output |
* | --- |
* | "Queue" |
*
* @param {Admin_Users_Filter_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_filter_queue: ((inputs?: Admin_Users_Filter_QueueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Users_Filter_QueueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Users_Filter_QueueInputs = {};
