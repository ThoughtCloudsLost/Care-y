/**
* | output |
* | --- |
* | "Copy {count} messages" |
*
* @param {Ticket_Copy_MessagesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_copy_messages: ((inputs: Ticket_Copy_MessagesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Copy_MessagesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Copy_MessagesInputs = {
    count: NonNullable<unknown>;
};
