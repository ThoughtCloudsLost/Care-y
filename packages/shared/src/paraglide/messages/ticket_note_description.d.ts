/**
* | output |
* | --- |
* | "Only visible to other members of your organization." |
*
* @param {Ticket_Note_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_note_description: ((inputs?: Ticket_Note_DescriptionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Note_DescriptionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Note_DescriptionInputs = {};
