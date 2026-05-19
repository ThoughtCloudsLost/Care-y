/**
* | output |
* | --- |
* | "Escalation days must be between {min} and 365." |
*
* @param {Admin_Queue_Editor_Escalation_RangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_escalation_range: ((inputs: Admin_Queue_Editor_Escalation_RangeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Editor_Escalation_RangeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Editor_Escalation_RangeInputs = {
    min: NonNullable<unknown>;
};
