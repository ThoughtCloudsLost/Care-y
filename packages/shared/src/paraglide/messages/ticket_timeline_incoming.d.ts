/**
* | output |
* | --- |
* | "{count} incoming" |
*
* @param {Ticket_Timeline_IncomingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_incoming: ((inputs: Ticket_Timeline_IncomingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Timeline_IncomingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Timeline_IncomingInputs = {
    count: NonNullable<unknown>;
};
