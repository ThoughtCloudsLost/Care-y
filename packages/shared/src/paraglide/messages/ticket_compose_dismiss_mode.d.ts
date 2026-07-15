/**
* | output |
* | --- |
* | "Dismiss compose" |
*
* @param {Ticket_Compose_Dismiss_ModeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_compose_dismiss_mode: ((inputs?: Ticket_Compose_Dismiss_ModeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Compose_Dismiss_ModeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Compose_Dismiss_ModeInputs = {};
