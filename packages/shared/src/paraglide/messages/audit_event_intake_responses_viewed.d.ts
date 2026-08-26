/**
* | output |
* | --- |
* | "Intake responses viewed" |
*
* @param {Audit_Event_Intake_Responses_ViewedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_intake_responses_viewed: ((inputs?: Audit_Event_Intake_Responses_ViewedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Intake_Responses_ViewedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Intake_Responses_ViewedInputs = {};
