/**
* | output |
* | --- |
* | "{count} messages" |
*
* @param {Ticket_Timeline_Messages_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_messages_count: ((inputs: Ticket_Timeline_Messages_CountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Timeline_Messages_CountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Timeline_Messages_CountInputs = {
    count: NonNullable<unknown>;
};
