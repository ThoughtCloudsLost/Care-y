/**
* | output |
* | --- |
* | "Assigned" |
*
* @param {Ticket_System_Assignment_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_assignment_change: ((inputs?: Ticket_System_Assignment_ChangeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Assignment_ChangeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Assignment_ChangeInputs = {};
