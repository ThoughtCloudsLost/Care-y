/**
* | output |
* | --- |
* | "Could not remove intake {queue} designation" |
*
* @param {Admin_Queue_Intake_Clear_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_clear_error: ((inputs: Admin_Queue_Intake_Clear_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Intake_Clear_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Intake_Clear_ErrorInputs = {
    queue: NonNullable<unknown>;
};
