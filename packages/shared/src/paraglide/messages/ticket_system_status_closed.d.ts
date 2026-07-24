/**
* | output |
* | --- |
* | "Closed" |
*
* @param {Ticket_System_Status_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_status_closed: ((inputs?: Ticket_System_Status_ClosedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Status_ClosedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Status_ClosedInputs = {};
