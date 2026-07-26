/**
* | output |
* | --- |
* | "Use as intake {queue}" |
*
* @param {Admin_Queue_Intake_SetInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_set: ((inputs: Admin_Queue_Intake_SetInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Intake_SetInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Intake_SetInputs = {
    queue: NonNullable<unknown>;
};
