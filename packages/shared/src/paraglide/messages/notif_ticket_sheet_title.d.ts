/**
* | output |
* | --- |
* | "Notifications for this {ticket}" |
*
* @param {Notif_Ticket_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_ticket_sheet_title: ((inputs: Notif_Ticket_Sheet_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Ticket_Sheet_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Ticket_Sheet_TitleInputs = {
    ticket: NonNullable<unknown>;
};
