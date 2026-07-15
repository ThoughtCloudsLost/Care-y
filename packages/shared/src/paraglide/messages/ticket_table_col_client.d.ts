/**
* | output |
* | --- |
* | "Client" |
*
* @param {Ticket_Table_Col_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_client: ((inputs?: Ticket_Table_Col_ClientInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Table_Col_ClientInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Table_Col_ClientInputs = {};
