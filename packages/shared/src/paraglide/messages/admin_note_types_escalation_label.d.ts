/**
* | output |
* | --- |
* | "Notify" |
*
* @param {Admin_Note_Types_Escalation_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_escalation_label: ((inputs?: Admin_Note_Types_Escalation_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Note_Types_Escalation_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Note_Types_Escalation_LabelInputs = {};
