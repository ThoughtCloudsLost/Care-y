/**
* | output |
* | --- |
* | "If you lose the password, ask your support contact for a new link." |
*
* @param {Portal_Passphrase_Success_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_success_note: ((inputs?: Portal_Passphrase_Success_NoteInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Passphrase_Success_NoteInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Passphrase_Success_NoteInputs = {};
