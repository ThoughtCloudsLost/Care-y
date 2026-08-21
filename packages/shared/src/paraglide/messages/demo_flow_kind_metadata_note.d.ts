/**
* | output |
* | --- |
* | "Structural or operational data (counts, timestamps, status). Not sensitive on its own." |
*
* @param {Demo_Flow_Kind_Metadata_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_metadata_note: ((inputs?: Demo_Flow_Kind_Metadata_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Kind_Metadata_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Kind_Metadata_NoteInputs = {};
