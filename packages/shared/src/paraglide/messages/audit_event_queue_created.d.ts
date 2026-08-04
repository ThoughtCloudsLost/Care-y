/**
* | output |
* | --- |
* | "Queue created" |
*
* @param {Audit_Event_Queue_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_queue_created: ((inputs?: Audit_Event_Queue_CreatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Queue_CreatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Queue_CreatedInputs = {};
