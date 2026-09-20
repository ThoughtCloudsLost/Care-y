/**
* | output |
* | --- |
* | "Queue updated" |
*
* @param {Audit_Event_Queue_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_queue_updated: ((inputs?: Audit_Event_Queue_UpdatedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Queue_UpdatedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Queue_UpdatedInputs = {};
