/**
* | output |
* | --- |
* | "Load all to sort completely" |
*
* @param {Ticket_Table_Load_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_table_load_all: ((inputs?: Ticket_Table_Load_AllInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Table_Load_AllInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Table_Load_AllInputs = {};
