/**
* | output |
* | --- |
* | "Escalation rule created" |
*
* @param {Audit_Event_Escalation_Rule_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_escalation_rule_created: ((inputs?: Audit_Event_Escalation_Rule_CreatedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Escalation_Rule_CreatedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Escalation_Rule_CreatedInputs = {};
