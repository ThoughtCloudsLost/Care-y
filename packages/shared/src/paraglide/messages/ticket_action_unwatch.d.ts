/**
* | output |
* | --- |
* | "Unwatch" |
*
* @param {Ticket_Action_UnwatchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_unwatch: ((inputs?: Ticket_Action_UnwatchInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Action_UnwatchInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Action_UnwatchInputs = {};
