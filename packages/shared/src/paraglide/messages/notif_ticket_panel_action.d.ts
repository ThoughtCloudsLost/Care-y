/**
* | output |
* | --- |
* | "Notification channels" |
*
* @param {Notif_Ticket_Panel_ActionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_ticket_panel_action: ((inputs?: Notif_Ticket_Panel_ActionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Ticket_Panel_ActionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Ticket_Panel_ActionInputs = {};
