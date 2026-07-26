/**
* | output |
* | --- |
* | "Intake {queue} designation removed" |
*
* @param {Admin_Queue_Intake_Clear_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_clear_success: ((inputs: Admin_Queue_Intake_Clear_SuccessInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Intake_Clear_SuccessInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Intake_Clear_SuccessInputs = {
    queue: NonNullable<unknown>;
};
