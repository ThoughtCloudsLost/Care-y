/**
* | output |
* | --- |
* | "Download {filename}" |
*
* @param {Attachment_DownloadInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const attachment_download: ((inputs: Attachment_DownloadInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Attachment_DownloadInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Attachment_DownloadInputs = {
    filename: NonNullable<unknown>;
};
