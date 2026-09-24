/**
* | output |
* | --- |
* | "Follow-up added" |
*
* @param {Audit_Event_Followup_AddedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_followup_added: ((inputs?: Audit_Event_Followup_AddedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Followup_AddedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Followup_AddedInputs = {};
