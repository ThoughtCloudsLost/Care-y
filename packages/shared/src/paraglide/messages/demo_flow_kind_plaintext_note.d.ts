/**
* | output |
* | --- |
* | "Readable content. Only appears above the encryption layer, never in the database." |
*
* @param {Demo_Flow_Kind_Plaintext_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_plaintext_note: ((inputs?: Demo_Flow_Kind_Plaintext_NoteInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Kind_Plaintext_NoteInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Kind_Plaintext_NoteInputs = {};
