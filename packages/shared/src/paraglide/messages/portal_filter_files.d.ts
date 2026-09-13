/**
* | output |
* | --- |
* | "Files" |
*
* @param {Portal_Filter_FilesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_filter_files: ((inputs?: Portal_Filter_FilesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Filter_FilesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Filter_FilesInputs = {};
