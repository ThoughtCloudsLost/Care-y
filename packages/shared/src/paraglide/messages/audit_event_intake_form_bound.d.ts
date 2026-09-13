/**
* | output |
* | --- |
* | "Intake form binding changed" |
*
* @param {Audit_Event_Intake_Form_BoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_intake_form_bound: ((inputs?: Audit_Event_Intake_Form_BoundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Intake_Form_BoundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Intake_Form_BoundInputs = {};
