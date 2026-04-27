/**
* | output |
* | --- |
* | "Copy 1 message" |
*
* @param {Ticket_Copy_One_MessageInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_copy_one_message: ((inputs?: Ticket_Copy_One_MessageInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Copy_One_MessageInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Copy_One_MessageInputs = {};
