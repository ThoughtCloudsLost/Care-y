/**
* | output |
* | --- |
* | "{name} unassigned" |
*
* @param {Ticket_System_Volunteer_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_system_volunteer_unassigned: ((inputs: Ticket_System_Volunteer_UnassignedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Volunteer_UnassignedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Volunteer_UnassignedInputs = {
    name: NonNullable<unknown>;
};
