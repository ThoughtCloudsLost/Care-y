/**
* | output |
* | --- |
* | "Member removed" |
*
* @param {Admin_Queue_Member_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_member_removed: ((inputs?: Admin_Queue_Member_RemovedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Member_RemovedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Member_RemovedInputs = {};
