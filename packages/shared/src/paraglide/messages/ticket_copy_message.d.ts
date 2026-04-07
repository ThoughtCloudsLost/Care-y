/**
* | output |
* | --- |
* | "Copy" |
*
* @param {Ticket_Copy_MessageInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_copy_message: ((inputs?: Ticket_Copy_MessageInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Copy_MessageInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Copy_MessageInputs = {};
