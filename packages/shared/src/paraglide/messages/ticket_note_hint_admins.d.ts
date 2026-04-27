/**
* | output |
* | --- |
* | "admins" |
*
* @param {Ticket_Note_Hint_AdminsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_note_hint_admins: ((inputs?: Ticket_Note_Hint_AdminsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Note_Hint_AdminsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Note_Hint_AdminsInputs = {};
