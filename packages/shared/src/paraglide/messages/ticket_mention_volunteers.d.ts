/**
* | output |
* | --- |
* | "Mention a {volunteer}" |
*
* @param {Ticket_Mention_VolunteersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_mention_volunteers: ((inputs: Ticket_Mention_VolunteersInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Mention_VolunteersInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Mention_VolunteersInputs = {
    volunteer: NonNullable<unknown>;
};
