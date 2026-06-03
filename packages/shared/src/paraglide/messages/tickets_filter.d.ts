/**
* | output |
* | --- |
* | "Filter {tickets}" |
*
* @param {Tickets_FilterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter: ((inputs: Tickets_FilterInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_FilterInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_FilterInputs = {
    tickets: NonNullable<unknown>;
};
