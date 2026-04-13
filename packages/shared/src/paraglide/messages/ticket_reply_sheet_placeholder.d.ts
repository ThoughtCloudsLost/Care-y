/**
* | output |
* | --- |
* | "Type a message..." |
*
* @param {Ticket_Reply_Sheet_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_sheet_placeholder: ((inputs?: Ticket_Reply_Sheet_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Reply_Sheet_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Reply_Sheet_PlaceholderInputs = {};
