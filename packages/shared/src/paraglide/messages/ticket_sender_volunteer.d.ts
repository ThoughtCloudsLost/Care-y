/**
* | output |
* | --- |
* | "Volunteer" |
*
* @param {Ticket_Sender_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_sender_volunteer: ((inputs?: Ticket_Sender_VolunteerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Sender_VolunteerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Sender_VolunteerInputs = {};
