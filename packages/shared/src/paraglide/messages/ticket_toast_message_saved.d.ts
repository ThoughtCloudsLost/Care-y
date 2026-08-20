/**
* | output |
* | --- |
* | "Message updated" |
*
* @param {Ticket_Toast_Message_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_message_saved: ((inputs?: Ticket_Toast_Message_SavedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_Message_SavedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_Message_SavedInputs = {};
