/**
* | output |
* | --- |
* | "Add member" |
*
* @param {Admin_Queue_Add_Member_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_add_member_button: ((inputs?: Admin_Queue_Add_Member_ButtonInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Add_Member_ButtonInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Add_Member_ButtonInputs = {};
