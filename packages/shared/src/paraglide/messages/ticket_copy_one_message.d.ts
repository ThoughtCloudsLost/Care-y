/**
* | output |
* | --- |
* | "Copy 1 message" |
*
* @param {Ticket_Copy_One_MessageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_copy_one_message: ((inputs?: Ticket_Copy_One_MessageInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Copy_One_MessageInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Copy_One_MessageInputs = {};
