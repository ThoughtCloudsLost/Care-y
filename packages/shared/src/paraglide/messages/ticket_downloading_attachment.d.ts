/**
* | output |
* | --- |
* | "Downloading {filename}..." |
*
* @param {Ticket_Downloading_AttachmentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_downloading_attachment: ((inputs: Ticket_Downloading_AttachmentInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Downloading_AttachmentInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Downloading_AttachmentInputs = {
    filename: NonNullable<unknown>;
};
