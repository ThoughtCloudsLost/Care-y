/**
* | output |
* | --- |
* | "This link can be opened once and expires in 72 hours. The text is kept in the case record. The client gets it by text message." |
*
* @param {Share_Sheet_Note_SmsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_sheet_note_sms: ((inputs?: Share_Sheet_Note_SmsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_Sheet_Note_SmsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_Sheet_Note_SmsInputs = {};
