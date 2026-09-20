/**
* | output |
* | --- |
* | "{count} outgoing" |
*
* @param {Ticket_Timeline_OutgoingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_outgoing: ((inputs: Ticket_Timeline_OutgoingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Timeline_OutgoingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Timeline_OutgoingInputs = {
    count: NonNullable<unknown>;
};
