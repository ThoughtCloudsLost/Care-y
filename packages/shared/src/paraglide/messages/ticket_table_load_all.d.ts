/**
* | output |
* | --- |
* | "Load all to sort completely" |
*
* @param {Ticket_Table_Load_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_table_load_all: ((inputs?: Ticket_Table_Load_AllInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Table_Load_AllInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Table_Load_AllInputs = {};
