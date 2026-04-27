/**
* | output |
* | --- |
* | "Escalation Days" |
*
* @param {Admin_Queue_Editor_Escalation_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_escalation_label: ((inputs?: Admin_Queue_Editor_Escalation_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Editor_Escalation_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Editor_Escalation_LabelInputs = {};
