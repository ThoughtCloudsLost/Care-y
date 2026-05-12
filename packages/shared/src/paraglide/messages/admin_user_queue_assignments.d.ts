/**
* | output |
* | --- |
* | "{Queue} Assignments" |
*
* @param {Admin_User_Queue_AssignmentsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_user_queue_assignments: ((inputs: Admin_User_Queue_AssignmentsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_User_Queue_AssignmentsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_User_Queue_AssignmentsInputs = {
    Queue: NonNullable<unknown>;
    queue: NonNullable<unknown>;
};
