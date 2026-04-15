/**
* | output |
* | --- |
* | "Downloading {filename}..." |
*
* @param {Attachment_DownloadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const attachment_downloading: ((inputs: Attachment_DownloadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Attachment_DownloadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Attachment_DownloadingInputs = {
    filename: NonNullable<unknown>;
};
