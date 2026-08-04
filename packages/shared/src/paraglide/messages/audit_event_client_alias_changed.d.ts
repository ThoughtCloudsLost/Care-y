/**
* | output |
* | --- |
* | "{Client} alias changed" |
*
* @param {Audit_Event_Client_Alias_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_client_alias_changed: ((inputs: Audit_Event_Client_Alias_ChangedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Client_Alias_ChangedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Client_Alias_ChangedInputs = {
    Client: NonNullable<unknown>;
    client: NonNullable<unknown>;
};
