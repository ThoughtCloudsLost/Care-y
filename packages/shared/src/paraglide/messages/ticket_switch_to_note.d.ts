/**
* | output |
* | --- |
* | "Switch to note mode" |
*
* @param {Ticket_Switch_To_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_switch_to_note: ((inputs?: Ticket_Switch_To_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Switch_To_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Switch_To_NoteInputs = {};
