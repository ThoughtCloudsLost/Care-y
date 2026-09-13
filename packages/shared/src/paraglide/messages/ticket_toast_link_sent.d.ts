/**
* | output |
* | --- |
* | "Link sent" |
*
* @param {Ticket_Toast_Link_SentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_link_sent: ((inputs?: Ticket_Toast_Link_SentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_Link_SentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_Link_SentInputs = {};
