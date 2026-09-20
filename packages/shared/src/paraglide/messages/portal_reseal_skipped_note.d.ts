/**
* | output |
* | --- |
* | "Some earlier messages could not be opened on this device, so they were left out of this change. Everything you can read here is unaffected." |
*
* @param {Portal_Reseal_Skipped_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_reseal_skipped_note: ((inputs?: Portal_Reseal_Skipped_NoteInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Reseal_Skipped_NoteInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Reseal_Skipped_NoteInputs = {};
