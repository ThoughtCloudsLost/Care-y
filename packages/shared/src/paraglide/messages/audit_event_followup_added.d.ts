/**
* | output |
* | --- |
* | "Follow-up added" |
*
* @param {Audit_Event_Followup_AddedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_followup_added: ((inputs?: Audit_Event_Followup_AddedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Followup_AddedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Followup_AddedInputs = {};
