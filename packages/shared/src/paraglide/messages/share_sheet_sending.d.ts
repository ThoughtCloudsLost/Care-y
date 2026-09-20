/**
* | output |
* | --- |
* | "Sending..." |
*
* @param {Share_Sheet_SendingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_sheet_sending: ((inputs?: Share_Sheet_SendingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_Sheet_SendingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_Sheet_SendingInputs = {};
