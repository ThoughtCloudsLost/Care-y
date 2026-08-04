/**
* | output |
* | --- |
* | "Ticket notifications reset to defaults" |
*
* @param {Notif_Ticket_Reset_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_ticket_reset_success: ((inputs?: Notif_Ticket_Reset_SuccessInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Ticket_Reset_SuccessInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Ticket_Reset_SuccessInputs = {};
