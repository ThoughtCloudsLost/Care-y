/**
* | output |
* | --- |
* | "{Ticket} content saved" |
*
* @param {Ticket_Content_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_content_saved: ((inputs: Ticket_Content_SavedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Content_SavedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Content_SavedInputs = {
    Ticket: NonNullable<unknown>;
    ticket: NonNullable<unknown>;
};
