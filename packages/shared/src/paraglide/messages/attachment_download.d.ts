/**
* | output |
* | --- |
* | "Download {filename}" |
*
* @param {Attachment_DownloadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const attachment_download: ((inputs: Attachment_DownloadInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Attachment_DownloadInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Attachment_DownloadInputs = {
    filename: NonNullable<unknown>;
};
