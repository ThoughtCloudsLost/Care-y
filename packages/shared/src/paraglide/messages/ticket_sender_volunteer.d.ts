/**
* | output |
* | --- |
* | "Volunteer" |
*
* @param {Ticket_Sender_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_sender_volunteer: ((inputs?: Ticket_Sender_VolunteerInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Sender_VolunteerInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Sender_VolunteerInputs = {};
