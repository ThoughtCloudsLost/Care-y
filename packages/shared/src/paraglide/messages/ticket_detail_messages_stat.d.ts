/**
* | output |
* | --- |
* | "{count} messages" |
*
* @param {Ticket_Detail_Messages_StatInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_detail_messages_stat: ((inputs: Ticket_Detail_Messages_StatInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Detail_Messages_StatInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Detail_Messages_StatInputs = {
    count: NonNullable<unknown>;
};
