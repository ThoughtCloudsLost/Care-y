/**
* | output |
* | --- |
* | "Copy link" |
*
* @param {Share_Sheet_CopyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_sheet_copy: ((inputs?: Share_Sheet_CopyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_Sheet_CopyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_Sheet_CopyInputs = {};
