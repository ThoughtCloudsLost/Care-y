/**
* | output |
* | --- |
* | "Copied 1 message" |
*
* @param {Ticket_One_Message_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_one_message_copied: ((inputs?: Ticket_One_Message_CopiedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_One_Message_CopiedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_One_Message_CopiedInputs = {};
