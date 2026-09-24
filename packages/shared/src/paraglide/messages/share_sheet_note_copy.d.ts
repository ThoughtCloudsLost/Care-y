/**
* | output |
* | --- |
* | "This link can be opened once and expires in 72 hours. The text is kept in the case record. Copy the link and deliver it yourself." |
*
* @param {Share_Sheet_Note_CopyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_sheet_note_copy: ((inputs?: Share_Sheet_Note_CopyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_Sheet_Note_CopyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_Sheet_Note_CopyInputs = {};
