/**
* | output |
* | --- |
* | "{label} ({count})" |
*
* @param {Ticket_System_Event_GroupedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_event_grouped: ((inputs: Ticket_System_Event_GroupedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Event_GroupedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Event_GroupedInputs = {
    label: NonNullable<unknown>;
    count: NonNullable<unknown>;
};
