/**
* | output |
* | --- |
* | "Edit message" |
*
* @param {Ticket_Edit_Message_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_edit_message_title: ((inputs?: Ticket_Edit_Message_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Edit_Message_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Edit_Message_TitleInputs = {};
