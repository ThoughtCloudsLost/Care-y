/**
* | output |
* | --- |
* | "Priority changed to {priority}" |
*
* @param {Ticket_System_Priority_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_priority_changed: ((inputs: Ticket_System_Priority_ChangedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Priority_ChangedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Priority_ChangedInputs = {
    priority: NonNullable<unknown>;
};
