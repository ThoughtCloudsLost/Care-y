/**
* | output |
* | --- |
* | "No members" |
*
* @param {Admin_Queue_No_MembersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_no_members: ((inputs?: Admin_Queue_No_MembersInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_No_MembersInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_No_MembersInputs = {};
