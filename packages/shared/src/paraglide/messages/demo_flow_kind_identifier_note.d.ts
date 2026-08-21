/**
* | output |
* | --- |
* | "Opaque reference (UUID, row ID). Carries no readable content on its own." |
*
* @param {Demo_Flow_Kind_Identifier_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_identifier_note: ((inputs?: Demo_Flow_Kind_Identifier_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Kind_Identifier_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Kind_Identifier_NoteInputs = {};
