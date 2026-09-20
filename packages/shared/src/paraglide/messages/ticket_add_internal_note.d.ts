/**
* | output |
* | --- |
* | "Internal Note" |
*
* @param {Ticket_Add_Internal_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_add_internal_note: ((inputs?: Ticket_Add_Internal_NoteInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Add_Internal_NoteInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Add_Internal_NoteInputs = {};
