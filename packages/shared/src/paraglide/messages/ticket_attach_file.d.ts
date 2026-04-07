/**
* | output |
* | --- |
* | "Attach file" |
*
* @param {Ticket_Attach_FileInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_attach_file: ((inputs?: Ticket_Attach_FileInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Attach_FileInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Attach_FileInputs = {};
