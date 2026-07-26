/**
* | output |
* | --- |
* | "New caller voicemails are routed to the intake queue" |
*
* @param {Admin_Queue_Intake_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_tooltip: ((inputs?: Admin_Queue_Intake_TooltipInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Intake_TooltipInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Intake_TooltipInputs = {};
