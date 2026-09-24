/**
* | output |
* | --- |
* | "Copied 1 message" |
*
* @param {Ticket_One_Message_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_one_message_copied: ((inputs?: Ticket_One_Message_CopiedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_One_Message_CopiedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_One_Message_CopiedInputs = {};
