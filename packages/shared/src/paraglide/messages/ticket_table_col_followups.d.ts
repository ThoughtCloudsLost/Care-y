/**
* | output |
* | --- |
* | "Follow-ups" |
*
* @param {Ticket_Table_Col_FollowupsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_followups: ((inputs?: Ticket_Table_Col_FollowupsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Table_Col_FollowupsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Table_Col_FollowupsInputs = {};
