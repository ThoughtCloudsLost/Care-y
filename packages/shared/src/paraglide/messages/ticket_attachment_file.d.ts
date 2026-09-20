/**
* | output |
* | --- |
* | "File: {filename} ({size})" |
*
* @param {Ticket_Attachment_FileInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_attachment_file: ((inputs: Ticket_Attachment_FileInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Attachment_FileInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Attachment_FileInputs = {
    filename: NonNullable<unknown>;
    size: NonNullable<unknown>;
};
