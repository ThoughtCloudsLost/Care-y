/**
* | output |
* | --- |
* | "Closed" |
*
* @param {Ticket_Closed_StampInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_closed_stamp: ((inputs?: Ticket_Closed_StampInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Closed_StampInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Closed_StampInputs = {};
