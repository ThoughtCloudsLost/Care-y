/**
* | output |
* | --- |
* | "Remove intake designation" |
*
* @param {Admin_Queue_Intake_ClearInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_clear: ((inputs?: Admin_Queue_Intake_ClearInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Intake_ClearInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Intake_ClearInputs = {};
