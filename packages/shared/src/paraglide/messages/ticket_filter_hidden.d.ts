/**
* | output |
* | --- |
* | "{count} filtered messages" |
*
* @param {Ticket_Filter_HiddenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_hidden: ((inputs: Ticket_Filter_HiddenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Filter_HiddenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Filter_HiddenInputs = {
    count: NonNullable<unknown>;
};
