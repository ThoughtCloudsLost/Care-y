/**
* | output |
* | --- |
* | "Queue" |
*
* @param {Ticket_Table_Col_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_queue: ((inputs?: Ticket_Table_Col_QueueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Table_Col_QueueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Table_Col_QueueInputs = {};
