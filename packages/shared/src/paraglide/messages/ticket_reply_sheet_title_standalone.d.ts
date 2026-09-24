/**
* | output |
* | --- |
* | "Reply" |
*
* @param {Ticket_Reply_Sheet_Title_StandaloneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_sheet_title_standalone: ((inputs?: Ticket_Reply_Sheet_Title_StandaloneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Reply_Sheet_Title_StandaloneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Reply_Sheet_Title_StandaloneInputs = {};
