/**
* | output |
* | --- |
* | "{Client} account reset" |
*
* @param {Audit_Event_Client_Account_ResetInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_client_account_reset: ((inputs: Audit_Event_Client_Account_ResetInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Client_Account_ResetInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Client_Account_ResetInputs = {
    Client: NonNullable<unknown>;
    client: NonNullable<unknown>;
};
