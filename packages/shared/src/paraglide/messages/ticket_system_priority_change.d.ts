/**
* | output |
* | --- |
* | "Priority changed" |
*
* @param {Ticket_System_Priority_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_priority_change: ((inputs?: Ticket_System_Priority_ChangeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Priority_ChangeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Priority_ChangeInputs = {};
