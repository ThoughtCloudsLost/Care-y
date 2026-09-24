/**
* | output |
* | --- |
* | "Copy {count} messages" |
*
* @param {Ticket_Copy_MessagesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_copy_messages: ((inputs: Ticket_Copy_MessagesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Copy_MessagesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Copy_MessagesInputs = {
    count: NonNullable<unknown>;
};
