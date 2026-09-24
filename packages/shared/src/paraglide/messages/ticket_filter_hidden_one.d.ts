/**
* | output |
* | --- |
* | "1 filtered message" |
*
* @param {Ticket_Filter_Hidden_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_hidden_one: ((inputs?: Ticket_Filter_Hidden_OneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Filter_Hidden_OneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Filter_Hidden_OneInputs = {};
