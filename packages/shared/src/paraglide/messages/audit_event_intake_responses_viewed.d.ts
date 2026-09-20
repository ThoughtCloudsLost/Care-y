/**
* | output |
* | --- |
* | "Intake responses viewed" |
*
* @param {Audit_Event_Intake_Responses_ViewedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_intake_responses_viewed: ((inputs?: Audit_Event_Intake_Responses_ViewedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Intake_Responses_ViewedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Intake_Responses_ViewedInputs = {};
