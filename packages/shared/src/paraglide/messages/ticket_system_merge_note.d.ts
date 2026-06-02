/**
* | output |
* | --- |
* | "Tickets merged" |
*
* @param {Ticket_System_Merge_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_merge_note: ((inputs?: Ticket_System_Merge_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Merge_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Merge_NoteInputs = {};
