/**
* | output |
* | --- |
* | "Mention a {volunteer}" |
*
* @param {Ticket_Mention_VolunteersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_mention_volunteers: ((inputs: Ticket_Mention_VolunteersInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Mention_VolunteersInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Mention_VolunteersInputs = {
    volunteer: NonNullable<unknown>;
};
