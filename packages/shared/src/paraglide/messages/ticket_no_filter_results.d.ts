/**
* | output |
* | --- |
* | "No messages match your filters" |
*
* @param {Ticket_No_Filter_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_no_filter_results: ((inputs?: Ticket_No_Filter_ResultsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_No_Filter_ResultsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_No_Filter_ResultsInputs = {};
