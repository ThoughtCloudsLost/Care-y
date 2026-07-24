/**
* | output |
* | --- |
* | "Reply to {Client}" |
*
* @param {Ticket_Reply_To_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_to_client: ((inputs: Ticket_Reply_To_ClientInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Reply_To_ClientInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Reply_To_ClientInputs = {
    Client: NonNullable<unknown>;
    client: NonNullable<unknown>;
};
