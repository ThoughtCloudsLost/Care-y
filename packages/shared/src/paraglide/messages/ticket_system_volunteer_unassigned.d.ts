/**
* | output |
* | --- |
* | "{name} unassigned" |
*
* @param {Ticket_System_Volunteer_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_volunteer_unassigned: ((inputs: Ticket_System_Volunteer_UnassignedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Volunteer_UnassignedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Volunteer_UnassignedInputs = {
    name: NonNullable<unknown>;
};
