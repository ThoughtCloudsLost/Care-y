/**
* | output |
* | --- |
* | "Intake" |
*
* @param {Admin_Queue_Intake_ChipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_chip: ((inputs?: Admin_Queue_Intake_ChipInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Intake_ChipInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Intake_ChipInputs = {};
