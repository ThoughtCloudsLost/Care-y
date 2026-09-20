/**
* | output |
* | --- |
* | "{count} filtered messages" |
*
* @param {Ticket_Filter_HiddenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_hidden: ((inputs: Ticket_Filter_HiddenInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Filter_HiddenInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Filter_HiddenInputs = {
    count: NonNullable<unknown>;
};
