/**
* | output |
* | --- |
* | "Assignee" |
*
* @param {Ticket_Table_Col_AssigneeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_assignee: ((inputs?: Ticket_Table_Col_AssigneeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Table_Col_AssigneeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Table_Col_AssigneeInputs = {};
