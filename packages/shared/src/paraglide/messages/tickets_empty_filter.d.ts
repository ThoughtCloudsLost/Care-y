/**
* | output |
* | --- |
* | "No {tickets} match this filter." |
*
* @param {Tickets_Empty_FilterInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_empty_filter: ((inputs: Tickets_Empty_FilterInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Empty_FilterInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Empty_FilterInputs = {
    tickets: NonNullable<unknown>;
    ticket: NonNullable<unknown>;
};
