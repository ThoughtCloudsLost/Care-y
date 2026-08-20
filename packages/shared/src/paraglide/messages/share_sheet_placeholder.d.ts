/**
* | output |
* | --- |
* | "Enter the information to share..." |
*
* @param {Share_Sheet_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_sheet_placeholder: ((inputs?: Share_Sheet_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_Sheet_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_Sheet_PlaceholderInputs = {};
