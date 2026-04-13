/**
* | output |
* | --- |
* | "Today" |
*
* @param {Ticket_Date_TodayInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_date_today: ((inputs?: Ticket_Date_TodayInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Date_TodayInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Date_TodayInputs = {};
