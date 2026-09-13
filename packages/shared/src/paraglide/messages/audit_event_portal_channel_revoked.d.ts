/**
* | output |
* | --- |
* | "Secure link removed" |
*
* @param {Audit_Event_Portal_Channel_RevokedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_portal_channel_revoked: ((inputs?: Audit_Event_Portal_Channel_RevokedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Portal_Channel_RevokedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Portal_Channel_RevokedInputs = {};
