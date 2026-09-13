/**
* | output |
* | --- |
* | "Edit message" |
*
* @param {Ticket_Edit_Message_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_edit_message_title: ((inputs?: Ticket_Edit_Message_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Edit_Message_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Edit_Message_TitleInputs = {};
