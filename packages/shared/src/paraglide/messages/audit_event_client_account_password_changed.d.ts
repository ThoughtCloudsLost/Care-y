/**
* | output |
* | --- |
* | "{Client} account password changed" |
*
* @param {Audit_Event_Client_Account_Password_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_client_account_password_changed: ((inputs: Audit_Event_Client_Account_Password_ChangedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Client_Account_Password_ChangedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Client_Account_Password_ChangedInputs = {
    Client: NonNullable<unknown>;
    client: NonNullable<unknown>;
};
