/**
* | output |
* | --- |
* | "No internal notes yet." |
*
* @param {Ticket_Panel_No_NotesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_no_notes: ((inputs?: Ticket_Panel_No_NotesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Panel_No_NotesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Panel_No_NotesInputs = {};
