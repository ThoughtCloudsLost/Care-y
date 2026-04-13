/**
* | output |
* | --- |
* | "Yesterday" |
*
* @param {Ticket_Date_YesterdayInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_date_yesterday: ((inputs?: Ticket_Date_YesterdayInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Date_YesterdayInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Date_YesterdayInputs = {};
