/**
* | output |
* | --- |
* | "{count} / {max}" |
*
* @param {Ticket_Edit_Message_CounterInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_edit_message_counter: ((inputs: Ticket_Edit_Message_CounterInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Edit_Message_CounterInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Edit_Message_CounterInputs = {
    count: NonNullable<unknown>;
    max: NonNullable<unknown>;
};
