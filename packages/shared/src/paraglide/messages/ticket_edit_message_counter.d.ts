/**
* | output |
* | --- |
* | "{count} / {max}" |
*
* @param {Ticket_Edit_Message_CounterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_edit_message_counter: ((inputs: Ticket_Edit_Message_CounterInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Edit_Message_CounterInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Edit_Message_CounterInputs = {
    count: NonNullable<unknown>;
    max: NonNullable<unknown>;
};
