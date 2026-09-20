/**
* | output |
* | --- |
* | "Messages are removed after 30 days of inactivity." |
*
* @param {Portal_Expiry_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_expiry_note: ((inputs?: Portal_Expiry_NoteInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Expiry_NoteInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Expiry_NoteInputs = {};
