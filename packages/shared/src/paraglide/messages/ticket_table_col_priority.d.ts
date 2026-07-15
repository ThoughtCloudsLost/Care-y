/**
* | output |
* | --- |
* | "Priority" |
*
* @param {Ticket_Table_Col_PriorityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_priority: ((inputs?: Ticket_Table_Col_PriorityInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Table_Col_PriorityInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Table_Col_PriorityInputs = {};
