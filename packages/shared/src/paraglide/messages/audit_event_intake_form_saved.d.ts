/**
* | output |
* | --- |
* | "Intake form saved" |
*
* @param {Audit_Event_Intake_Form_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_intake_form_saved: ((inputs?: Audit_Event_Intake_Form_SavedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Intake_Form_SavedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Intake_Form_SavedInputs = {};
