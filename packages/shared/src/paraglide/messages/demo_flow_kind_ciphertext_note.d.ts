/**
* | output |
* | --- |
* | "Encrypted at rest. A seized database yields only this opaque value." |
*
* @param {Demo_Flow_Kind_Ciphertext_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_ciphertext_note: ((inputs?: Demo_Flow_Kind_Ciphertext_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Kind_Ciphertext_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Kind_Ciphertext_NoteInputs = {};
