/**
* | output |
* | --- |
* | "Downloading {filename}..." |
*
* @param {Ticket_Downloading_AttachmentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_downloading_attachment: ((inputs: Ticket_Downloading_AttachmentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Downloading_AttachmentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Downloading_AttachmentInputs = {
    filename: NonNullable<unknown>;
};
