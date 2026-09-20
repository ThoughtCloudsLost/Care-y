/**
* | output |
* | --- |
* | "Downloading {filename}..." |
*
* @param {Attachment_DownloadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const attachment_downloading: ((inputs: Attachment_DownloadingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Attachment_DownloadingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Attachment_DownloadingInputs = {
    filename: NonNullable<unknown>;
};
