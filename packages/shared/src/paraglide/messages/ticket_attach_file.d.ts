/**
* | output |
* | --- |
* | "Attach file" |
*
* @param {Ticket_Attach_FileInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_attach_file: ((inputs?: Ticket_Attach_FileInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Attach_FileInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Attach_FileInputs = {};
