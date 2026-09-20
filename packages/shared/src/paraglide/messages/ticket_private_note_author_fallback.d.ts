/**
* | output |
* | --- |
* | "Note" |
*
* @param {Ticket_Private_Note_Author_FallbackInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_private_note_author_fallback: ((inputs?: Ticket_Private_Note_Author_FallbackInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Private_Note_Author_FallbackInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Private_Note_Author_FallbackInputs = {};
