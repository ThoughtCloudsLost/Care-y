/**
* | output |
* | --- |
* | "Disbursement" |
*
* @param {Fund_Note_EyebrowInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_note_eyebrow: ((inputs?: Fund_Note_EyebrowInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Note_EyebrowInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Note_EyebrowInputs = {};
