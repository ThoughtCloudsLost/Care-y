/**
* | output |
* | --- |
* | "{Client} email changed" |
*
* @param {Audit_Event_Client_Email_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_client_email_changed: ((inputs: Audit_Event_Client_Email_ChangedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Client_Email_ChangedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Client_Email_ChangedInputs = {
    Client: NonNullable<unknown>;
    client: NonNullable<unknown>;
};
