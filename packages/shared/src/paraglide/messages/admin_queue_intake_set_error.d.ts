/**
* | output |
* | --- |
* | "Could not update intake {queue}" |
*
* @param {Admin_Queue_Intake_Set_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_set_error: ((inputs: Admin_Queue_Intake_Set_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Intake_Set_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Intake_Set_ErrorInputs = {
    queue: NonNullable<unknown>;
};
