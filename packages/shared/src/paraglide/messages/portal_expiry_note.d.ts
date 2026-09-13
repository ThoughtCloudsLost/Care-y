/**
* | output |
* | --- |
* | "Messages are removed after 30 days of inactivity." |
*
* @param {Portal_Expiry_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_expiry_note: ((inputs?: Portal_Expiry_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Expiry_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Expiry_NoteInputs = {};
