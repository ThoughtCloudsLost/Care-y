/**
* | output |
* | --- |
* | "If you lose the password, ask your support contact for a new link." |
*
* @param {Portal_Passphrase_Success_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_success_note: ((inputs?: Portal_Passphrase_Success_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Passphrase_Success_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Passphrase_Success_NoteInputs = {};
