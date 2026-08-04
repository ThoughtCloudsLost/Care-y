/**
* | output |
* | --- |
* | "Reset to my defaults" |
*
* @param {Notif_Ticket_ResetInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_ticket_reset: ((inputs?: Notif_Ticket_ResetInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Ticket_ResetInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Ticket_ResetInputs = {};
