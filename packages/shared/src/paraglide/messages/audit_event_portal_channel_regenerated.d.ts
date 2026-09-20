/**
* | output |
* | --- |
* | "Secure link regenerated" |
*
* @param {Audit_Event_Portal_Channel_RegeneratedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_portal_channel_regenerated: ((inputs?: Audit_Event_Portal_Channel_RegeneratedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Portal_Channel_RegeneratedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Portal_Channel_RegeneratedInputs = {};
