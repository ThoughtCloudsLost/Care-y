/**
* | output |
* | --- |
* | "Sorting {count} loaded" |
*
* @param {Ticket_Table_Partial_SortInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_table_partial_sort: ((inputs: Ticket_Table_Partial_SortInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Table_Partial_SortInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Table_Partial_SortInputs = {
    count: NonNullable<unknown>;
};
