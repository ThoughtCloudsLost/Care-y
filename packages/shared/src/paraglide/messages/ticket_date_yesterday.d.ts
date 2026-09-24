/**
* | output |
* | --- |
* | "Yesterday" |
*
* @param {Ticket_Date_YesterdayInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_date_yesterday: ((inputs?: Ticket_Date_YesterdayInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Date_YesterdayInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Date_YesterdayInputs = {};
