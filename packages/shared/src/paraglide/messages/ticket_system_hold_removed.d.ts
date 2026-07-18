/**
* | output |
* | --- |
* | "Removed from hold" |
*
* @param {Ticket_System_Hold_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_hold_removed: ((inputs?: Ticket_System_Hold_RemovedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Hold_RemovedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Hold_RemovedInputs = {};
