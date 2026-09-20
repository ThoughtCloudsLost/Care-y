/**
* | output |
* | --- |
* | "Message history recovered to secure link" |
*
* @param {Audit_Event_Portal_History_Reseed_ChunkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_portal_history_reseed_chunk: ((inputs?: Audit_Event_Portal_History_Reseed_ChunkInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Portal_History_Reseed_ChunkInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Portal_History_Reseed_ChunkInputs = {};
