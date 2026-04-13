/**
* | output |
* | --- |
* | "This note will be removed from the conversation. This cannot be undone." |
*
* @param {Ticket_Delete_Note_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_delete_note_confirm_body: ((inputs?: Ticket_Delete_Note_Confirm_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Delete_Note_Confirm_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Delete_Note_Confirm_BodyInputs = {};
