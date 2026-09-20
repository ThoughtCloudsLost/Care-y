/**
* | output |
* | --- |
* | "Queue deleted" |
*
* @param {Audit_Event_Queue_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_queue_deleted: ((inputs?: Audit_Event_Queue_DeletedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Queue_DeletedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Queue_DeletedInputs = {};
