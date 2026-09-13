/**
* | output |
* | --- |
* | "Secure link regenerated" |
*
* @param {Audit_Event_Portal_Channel_RegeneratedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_portal_channel_regenerated: ((inputs?: Audit_Event_Portal_Channel_RegeneratedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Portal_Channel_RegeneratedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Portal_Channel_RegeneratedInputs = {};
