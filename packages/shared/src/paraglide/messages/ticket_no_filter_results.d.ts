/**
* | output |
* | --- |
* | "No messages match your filters" |
*
* @param {Ticket_No_Filter_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_no_filter_results: ((inputs?: Ticket_No_Filter_ResultsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_No_Filter_ResultsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_No_Filter_ResultsInputs = {};
