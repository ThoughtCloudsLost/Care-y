/**
* | output |
* | --- |
* | "{name} assigned" |
*
* @param {Ticket_System_Volunteer_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_volunteer_assigned: ((inputs: Ticket_System_Volunteer_AssignedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Volunteer_AssignedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Volunteer_AssignedInputs = {
    name: NonNullable<unknown>;
};
