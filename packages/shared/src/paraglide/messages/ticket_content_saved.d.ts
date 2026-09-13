/**
* | output |
* | --- |
* | "{Ticket} content saved" |
*
* @param {Ticket_Content_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_content_saved: ((inputs: Ticket_Content_SavedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Content_SavedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Content_SavedInputs = {
    Ticket: NonNullable<unknown>;
    ticket: NonNullable<unknown>;
};
