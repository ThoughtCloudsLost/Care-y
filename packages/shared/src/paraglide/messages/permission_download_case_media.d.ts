/**
* | output |
* | --- |
* | "Download case media" |
*
* @param {Permission_Download_Case_MediaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_download_case_media: ((inputs?: Permission_Download_Case_MediaInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Download_Case_MediaInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Download_Case_MediaInputs = {};
