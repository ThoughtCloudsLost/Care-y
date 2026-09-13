/**
* | output |
* | --- |
* | "This message is too long to send as a secure link." |
*
* @param {Share_Sheet_Too_LongInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_sheet_too_long: ((inputs?: Share_Sheet_Too_LongInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_Sheet_Too_LongInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_Sheet_Too_LongInputs = {};
