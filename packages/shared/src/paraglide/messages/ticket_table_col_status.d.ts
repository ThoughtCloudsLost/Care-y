/**
* | output |
* | --- |
* | "Status" |
*
* @param {Ticket_Table_Col_StatusInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_status: ((inputs?: Ticket_Table_Col_StatusInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Table_Col_StatusInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Table_Col_StatusInputs = {};
