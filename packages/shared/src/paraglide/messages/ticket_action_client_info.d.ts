/**
* | output |
* | --- |
* | "{Client} Info" |
*
* @param {Ticket_Action_Client_InfoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_client_info: ((inputs: Ticket_Action_Client_InfoInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Action_Client_InfoInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Action_Client_InfoInputs = {
    Client: NonNullable<unknown>;
    client: NonNullable<unknown>;
};
