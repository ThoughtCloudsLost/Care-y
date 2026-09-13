/**
* | output |
* | --- |
* | "{Client} account created" |
*
* @param {Audit_Event_Client_Account_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_client_account_created: ((inputs: Audit_Event_Client_Account_CreatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Client_Account_CreatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Client_Account_CreatedInputs = {
    Client: NonNullable<unknown>;
    client: NonNullable<unknown>;
};
