/**
* | output |
* | --- |
* | "Days before a ticket auto-escalates. Leave empty to disable." |
*
* @param {Admin_Queue_Editor_Escalation_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_escalation_hint: ((inputs?: Admin_Queue_Editor_Escalation_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Editor_Escalation_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Editor_Escalation_HintInputs = {};
