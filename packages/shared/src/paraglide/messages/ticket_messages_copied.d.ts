/**
* | output |
* | --- |
* | "Copied {count} messages" |
*
* @param {Ticket_Messages_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_messages_copied: ((inputs: Ticket_Messages_CopiedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Messages_CopiedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Messages_CopiedInputs = {
    count: NonNullable<unknown>;
};
