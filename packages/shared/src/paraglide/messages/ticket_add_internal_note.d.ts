/**
* | output |
* | --- |
* | "Internal Note" |
*
* @param {Ticket_Add_Internal_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_add_internal_note: ((inputs?: Ticket_Add_Internal_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Add_Internal_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Add_Internal_NoteInputs = {};
