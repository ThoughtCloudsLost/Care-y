/**
* | output |
* | --- |
* | "Event" |
*
* @param {Ticket_System_EventInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_event: ((inputs?: Ticket_System_EventInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_EventInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_EventInputs = {};
