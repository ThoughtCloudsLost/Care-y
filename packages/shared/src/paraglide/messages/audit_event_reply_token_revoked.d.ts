/**
* | output |
* | --- |
* | "Email reply token revoked" |
*
* @param {Audit_Event_Reply_Token_RevokedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_reply_token_revoked: ((inputs?: Audit_Event_Reply_Token_RevokedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Reply_Token_RevokedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Reply_Token_RevokedInputs = {};
