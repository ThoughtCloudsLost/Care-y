/**
* | output |
* | --- |
* | "{Queue}" |
*
* @param {Ticket_Panel_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_queue: ((inputs: Ticket_Panel_QueueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Panel_QueueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Panel_QueueInputs = {
    Queue: NonNullable<unknown>;
};
