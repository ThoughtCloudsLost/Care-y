/**
* | output |
* | --- |
* | "Intake {queue} updated" |
*
* @param {Admin_Queue_Intake_Set_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_set_success: ((inputs: Admin_Queue_Intake_Set_SuccessInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Intake_Set_SuccessInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Intake_Set_SuccessInputs = {
    queue: NonNullable<unknown>;
};
