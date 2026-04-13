/**
* | output |
* | --- |
* | "Private note by {author}" |
*
* @param {Ticket_Private_Note_ByInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_private_note_by: ((inputs: Ticket_Private_Note_ByInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Private_Note_ByInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Private_Note_ByInputs = {
    author: NonNullable<unknown>;
};
