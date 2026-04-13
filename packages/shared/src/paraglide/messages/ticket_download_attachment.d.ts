/**
* | output |
* | --- |
* | "Download {filename}" |
*
* @param {Ticket_Download_AttachmentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_download_attachment: ((inputs: Ticket_Download_AttachmentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Download_AttachmentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Download_AttachmentInputs = {
    filename: NonNullable<unknown>;
};
