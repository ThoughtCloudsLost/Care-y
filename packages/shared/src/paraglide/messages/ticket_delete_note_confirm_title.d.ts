/**
* | output |
* | --- |
* | "Delete Note" |
*
* @param {Ticket_Delete_Note_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_delete_note_confirm_title: ((inputs?: Ticket_Delete_Note_Confirm_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Delete_Note_Confirm_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Delete_Note_Confirm_TitleInputs = {};
