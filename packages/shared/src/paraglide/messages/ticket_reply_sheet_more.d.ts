/**
* | output |
* | --- |
* | "and {count} more" |
*
* @param {Ticket_Reply_Sheet_MoreInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_sheet_more: ((inputs: Ticket_Reply_Sheet_MoreInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Reply_Sheet_MoreInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Reply_Sheet_MoreInputs = {
    count: NonNullable<unknown>;
};
