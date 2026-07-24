/**
* | output |
* | --- |
* | "Follow-ups" |
*
* @param {Ticket_Table_Col_FollowupsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_followups: ((inputs?: Ticket_Table_Col_FollowupsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Table_Col_FollowupsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Table_Col_FollowupsInputs = {};
