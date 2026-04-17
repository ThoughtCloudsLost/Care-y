/**
* | output |
* | --- |
* | "Remove {name}" |
*
* @param {Admin_Queue_Remove_MemberInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_remove_member: ((inputs: Admin_Queue_Remove_MemberInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Remove_MemberInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Remove_MemberInputs = {
    name: NonNullable<unknown>;
};
