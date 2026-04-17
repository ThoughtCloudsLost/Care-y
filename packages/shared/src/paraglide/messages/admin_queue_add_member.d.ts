/**
* | output |
* | --- |
* | "Add member" |
*
* @param {Admin_Queue_Add_MemberInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_add_member: ((inputs?: Admin_Queue_Add_MemberInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Add_MemberInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Add_MemberInputs = {};
