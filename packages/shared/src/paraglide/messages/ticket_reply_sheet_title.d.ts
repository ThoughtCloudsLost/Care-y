/**
* | output |
* | --- |
* | "Reply to {alias}" |
*
* @param {Ticket_Reply_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_sheet_title: ((inputs: Ticket_Reply_Sheet_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Reply_Sheet_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Reply_Sheet_TitleInputs = {
    alias: NonNullable<unknown>;
};
