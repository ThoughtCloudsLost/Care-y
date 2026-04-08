/**
* | output |
* | --- |
* | "View timeline" |
*
* @param {Ticket_Action_TimelineInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_timeline: ((inputs?: Ticket_Action_TimelineInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Action_TimelineInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Action_TimelineInputs = {};
