/**
* | output |
* | --- |
* | "No {volunteers} available to add" |
*
* @param {Admin_Queue_Member_Picker_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_member_picker_empty: ((inputs: Admin_Queue_Member_Picker_EmptyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Member_Picker_EmptyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Member_Picker_EmptyInputs = {
    volunteers: NonNullable<unknown>;
};
