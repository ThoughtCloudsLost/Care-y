/**
* | output |
* | --- |
* | "A volunteer" |
*
* @param {Ticket_System_Volunteer_FallbackInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_volunteer_fallback: ((inputs?: Ticket_System_Volunteer_FallbackInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Volunteer_FallbackInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Volunteer_FallbackInputs = {};
