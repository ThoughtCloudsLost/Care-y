/**
* | output |
* | --- |
* | "1 filtered message" |
*
* @param {Ticket_Filter_Hidden_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_hidden_one: ((inputs?: Ticket_Filter_Hidden_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Filter_Hidden_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Filter_Hidden_OneInputs = {};
