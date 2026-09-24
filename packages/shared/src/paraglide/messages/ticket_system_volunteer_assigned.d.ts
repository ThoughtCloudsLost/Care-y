/**
* | output |
* | --- |
* | "{name} assigned" |
*
* @param {Ticket_System_Volunteer_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_system_volunteer_assigned: ((inputs: Ticket_System_Volunteer_AssignedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Volunteer_AssignedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Volunteer_AssignedInputs = {
    name: NonNullable<unknown>;
};
