/**
* | output |
* | --- |
* | "Intake responses exported as CSV" |
*
* @param {Audit_Event_Intake_Responses_ExportedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_intake_responses_exported: ((inputs?: Audit_Event_Intake_Responses_ExportedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Intake_Responses_ExportedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Intake_Responses_ExportedInputs = {};
