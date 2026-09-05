/**
* | output |
* | --- |
* | "Reply" |
*
* @param {Ticket_Reply_Sheet_Title_StandaloneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_sheet_title_standalone: ((inputs?: Ticket_Reply_Sheet_Title_StandaloneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Reply_Sheet_Title_StandaloneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Reply_Sheet_Title_StandaloneInputs = {};
