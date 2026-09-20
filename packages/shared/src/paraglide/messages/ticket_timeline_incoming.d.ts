/**
* | output |
* | --- |
* | "{count} incoming" |
*
* @param {Ticket_Timeline_IncomingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_incoming: ((inputs: Ticket_Timeline_IncomingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Timeline_IncomingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Timeline_IncomingInputs = {
    count: NonNullable<unknown>;
};
