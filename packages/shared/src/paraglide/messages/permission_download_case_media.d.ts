/**
* | output |
* | --- |
* | "Download recordings and files" |
*
* @param {Permission_Download_Case_MediaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_download_case_media: ((inputs?: Permission_Download_Case_MediaInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Download_Case_MediaInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Download_Case_MediaInputs = {};
