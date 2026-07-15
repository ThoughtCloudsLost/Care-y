/**
* | output |
* | --- |
* | "Msgs" |
*
* @param {Ticket_Table_Col_MsgsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_msgs: ((inputs?: Ticket_Table_Col_MsgsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Table_Col_MsgsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Table_Col_MsgsInputs = {};
