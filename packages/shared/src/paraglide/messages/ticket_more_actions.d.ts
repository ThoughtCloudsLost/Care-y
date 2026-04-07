/**
* | output |
* | --- |
* | "More actions" |
*
* @param {Ticket_More_ActionsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_more_actions: ((inputs?: Ticket_More_ActionsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_More_ActionsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_More_ActionsInputs = {};
