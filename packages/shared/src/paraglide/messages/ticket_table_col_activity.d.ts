/**
* | output |
* | --- |
* | "Activity" |
*
* @param {Ticket_Table_Col_ActivityInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_activity: ((inputs?: Ticket_Table_Col_ActivityInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Table_Col_ActivityInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Table_Col_ActivityInputs = {};
